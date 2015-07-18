import BPromise from "bluebird";
import {DynamoDB} from "aws-sdk";

BPromise.promisifyAll(DynamoDB);
export default new DynamoDB();
