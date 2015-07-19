import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

import insertPodReading from "pipeline/insert-pod-reading";

describe("insertPodReading", function () {

    var dynamodb = {
        putItemAsync: sinon.spy()
    };
    var TABLE_NAME = "table";

    before(function () {
        insertPodReading.__Rewire__("dynamodb", dynamodb);
        insertPodReading.__Rewire__("TABLE_NAME", TABLE_NAME);
    });

    after(function () {
        insertPodReading.__ResetDependency__("dynamodb");
        insertPodReading.__ResetDependency__("TABLE_NAME");
    });

    it("makes an API call to dynamodb.putItemAsync", function () {
        var podReading = {
            date: 0,
            podId: "podId",
            type: "attiva",
            value: 50
        };
        insertPodReading(podReading);
        expect(dynamodb.putItemAsync).to.have.been.calledWith({
            Item: {
                date: {
                    N: "0"
                },
                readingId: {
                    S: "podId.0.attiva"
                },
                value: {
                    N: "50"
                }
            },
            TableName: TABLE_NAME
        });
    });

});
