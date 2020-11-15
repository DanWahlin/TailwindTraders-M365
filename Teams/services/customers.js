const fetch = require('node-fetch');

class CustomerService {

    async getLatestCustomer() {
        const customers = await this.getJson('/api/customers');
        const salesPeople = await this.getJson('/api/salespeople');
        if (customers && customers.length) {
            const customer = customers[customers.length - 1];
            if (salesPeople && salesPeople.length) {
                const salesPerson = salesPeople.find(salesPerson => salesPerson.id === customer.salesPersonId);
                customer.salesPerson = (salesPerson) ? salesPerson.firstName + ' ' + salesPerson.lastName : '';
            }
            return customer;
        }
        else {
            return null;
        }
    }

    async getJson(apiUrl) {
        let result;
        try {
            // Checking port since if ngrok is specific and port is 80 we don't want to add it (will break)
            const port = (process.env.CrmPort === '80') ? '' : `:${process.env.CrmPort}`;
            const url = `${process.env.CrmUrl}${port}${apiUrl}`;
            const response = await fetch(url, {
                method: "GET",
                headers: { Accept: "application/json" }
            });
    
            console.log (`Received ${apiUrl} data with status code ${response.status}`);
    
            if (response.status !== 200) {
                throw `Response error ${response.status}: ${response.statusText}`;
            }

            const result = await response.json();   
            return result; 
        }
        catch (error) {
            console.log(error);
        }
        
        return null;
    }
}

module.exports = CustomerService;