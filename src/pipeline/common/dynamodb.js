import BPromise from "bluebird";
import {DynamoDB} from "aws-sdk";

export default BPromise.promisifyAll(new DynamoDB());
