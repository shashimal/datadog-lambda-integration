function handler(event) {
    console.log("Customer API")
    return {
        body: JSON.stringify({
            customerId: '1',
            name: 'John',
            address: '145 Singapore'
        }),
        statusCode: 200,
    };
}

module.exports = {handler};