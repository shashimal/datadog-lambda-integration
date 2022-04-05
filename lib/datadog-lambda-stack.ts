import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Rule, Schedule} from "aws-cdk-lib/aws-events";
import {Code, Function, FunctionBase, Runtime} from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import {LambdaFunction} from "aws-cdk-lib/aws-events-targets";
import {Datadog} from "datadog-cdk-constructs-v2";

export class DatadogLambdaStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        //Customer API Lambda
        const customerApi = new Function(this, 'CustomerAPI', {
            functionName: 'Customer-API',
            runtime: Runtime.NODEJS_14_X,
            memorySize: 512,
            handler: 'index.handler',
            code: Code.fromAsset(path.join(__dirname, '../lambda/customer')),
            environment: {
                DD_ENV: 'prod',
                DD_SERVICE: 'Customer-Service',
                DD_VERSION: '1',
                DD_TAGS:'name:customer-api'
            }
        })

        //Order API Lambda
        const orderApi = new Function(this, 'OrderAPI', {
            functionName: 'Order-API',
            runtime: Runtime.NODEJS_14_X,
            memorySize: 512,
            handler: 'index.handler',
            code: Code.fromAsset(path.join(__dirname, '../lambda/order')),
            environment: {
                DD_ENV: 'prod',
                DD_SERVICE: 'Order-Service',
                DD_VERSION: '1',
                DD_TAGS:'name:order-api'
            }
        })

        //Datadog integration
        const dataDog = new Datadog(this, "DataDogIntegratoin", {
            nodeLayerVersion: 74,
            extensionLayerVersion: 21,
            apiKey: 'fefec54589a5622b9f2c0e97889558d3',
            site: 'datadoghq.com'
        });

        dataDog.addLambdaFunctions([customerApi,orderApi]);

        //Added this for testing
        //Event rule which runs the job every five minutes
        const cronRuleCustomer = new Rule(this, 'cronRuleCustomer', {
            schedule: Schedule.expression('cron(0/2 * * * ? *)'),
            enabled: true
        });

        const cronRuleOrder = new Rule(this, 'CustomerOrder', {
            schedule: Schedule.expression('cron(0/2 * * * ? *)'),
            enabled: true
        });

        //Trigger the lambda functions
        cronRuleCustomer.addTarget(new LambdaFunction(customerApi));
        cronRuleOrder.addTarget(new LambdaFunction(orderApi));
    }
}
