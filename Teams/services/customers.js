const fetch = require('node-fetch');

class CustomerService {

    async getLatestCustomer() {
        const customer = await this.getJson('/api/latestCustomer');
        const salesPeople = await this.getJson('/api/salespeople');
        if (customer) {
            // Get customer's sales person
            const salesPerson = await this.getCustomerSalesPerson(customer.salesPersonId);
            if (salesPerson) {
                customer.salesPerson = (salesPerson) ? salesPerson.firstName + ' ' + salesPerson.lastName : '';
            }
            return customer;
        }
        return null;
    }

    async getCustomerSalesPerson(salesPersonId) {
        const salesPeople = await this.getJson('/api/salespeople');
        if (salesPeople && salesPeople.length) {
            const salesPerson = salesPeople.find(salesPerson => salesPerson.id === salesPersonId);
            return salesPerson;
        }
        return null;
    }

    async getCustomersBySalesPerson(salesPersonName) {
        if (salesPersonName) {
            // If salesPersonName == Burke Holland
            // Example: https://learntogethercrm.ngrok.io/api/customersBySalesPerson/Burke%20Holland
            const customers = await this.getJson('/api/customersBySalesPerson/' + salesPersonName);
            return customers;
        }
        return null;
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