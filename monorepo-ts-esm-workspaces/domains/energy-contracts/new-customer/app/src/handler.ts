import type { APIGatewayProxyEvent, Context } from "aws-lambda";
import { validate } from "class-validator";
import { Customer } from "@new-customer/api-models/Customer.js";
import { Address } from "@packages/base-models/models/Address.js";
import { EnergyType } from "@packages/base-models/enums/EnergyType.js";
import { CustomerContact } from "@new-customer/api-models/CustomerContact.js";

export async function handler(event: APIGatewayProxyEvent, context: Context) {
  console.info(event);
  console.info(context);

  const body = JSON.parse(event.body ?? "{}");
  const contactInfo = new CustomerContact();
  const customer = new Customer();
  customer.address = new Address();
  customer.address.houseNumber = body.houseNumber;
  customer.address.street = body.street;
  customer.energyType = EnergyType.ELECTRICITY;
  customer.id = "1";

  const result = await validate(customer);
  if (result.length > 0) {
    result.forEach((validationError) => console.error(validationError));
    return {
      statusCode: 400,
    };
  }
  console.info("Success");
  return {
    statusCode: 200,
  };
}
