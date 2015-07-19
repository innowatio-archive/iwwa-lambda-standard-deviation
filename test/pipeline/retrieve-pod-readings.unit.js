import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

import retrievePodReadings from "pipeline/retrieve-pod-readings";
import getNeighbouringDates from "pipeline/common/get-neighbouring-dates";

describe("retrievePodReadings", function () {

    var dynamodb = {
        batchGetItemAsync: sinon.spy()
    };
    var TABLE_NAME = "table";
    var WEEKS = 3;

    before(function () {
        retrievePodReadings.__Rewire__("dynamodb", dynamodb);
        retrievePodReadings.__Rewire__("TABLE_NAME", TABLE_NAME);
        getNeighbouringDates.__Rewire__("WEEKS", WEEKS);
    });

    after(function () {
        retrievePodReadings.__ResetDependency__("dynamodb");
        retrievePodReadings.__ResetDependency__("TABLE_NAME");
        getNeighbouringDates.__ResetDependency__("WEEKS");
    });

    it("makes an API call to dynamodb.batchGetItemAsync", function () {
        var podReading = {
            date: 0,
            podId: "podId",
            type: "attiva",
            value: 50
        };
        retrievePodReadings(podReading);
        expect(dynamodb.batchGetItemAsync).to.have.been.calledWith({
            RequestItems: {
                [TABLE_NAME]: {
                    Keys: [
                        {readingId: {S: "podId.-1209600000.attiva"}},
                        {readingId: {S: "podId.-604800000.attiva"}},
                        {readingId: {S: "podId.604800000.attiva"}},
                        {readingId: {S: "podId.1209600000.attiva"}}
                    ]
                }
            }
        });
    });

});
