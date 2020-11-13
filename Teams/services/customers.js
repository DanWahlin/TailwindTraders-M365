class CustomerService {

    async getLatestCustomer() {
        const customers = await this.getCustomers();
        if (customers && customers.length > 0) {
            return customers[customers.length-1];
        }
        else {
            return null;
        }
    }

    async getCustomers() {

        let result;

        try {
            const url = `${process.env.CrmUrl}:${process.env.CrmPort}/api/customers/`;
            const response = await fetch(url, {
                method: "GET",
                headers: { Accept: "application/json" }
            });
    
            console.log (`Received customers with status code ${response.status}`);
    
            if (response.status !== 200) {
                throw `Response error ${response.status}: ${response.statusText}`;
            }

            result = await response.json();

            return result
    
        }
        catch (error) {
            console.log(error);
            result = 
            [{
                "id": 1,
                "firstName": `Error fetching customer data`,
                "lastName": "",
                "gender": "",
                "address": error,
                "city": "  ",
                "state": {
                    "abbreviation": "",
                    "name": ""
                },
                "orders": [],
                "latitude": 0,
                "longitude": 0
            }];
        }
        
        return result;
    }
}

module.exports.CustomerService = CustomerService;