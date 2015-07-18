import {expect} from "chai";
import {mean, standardDeviation} from "simple-statistics";

import aggregate from "pipeline/aggregate";
import getNeighbouringDates from "pipeline/common/get-neighbouring-dates";

describe("aggregate", function () {

    var WEEKS = 3;

    before(function () {
        aggregate.__Rewire__("WEEKS", WEEKS);
        getNeighbouringDates.__Rewire__("WEEKS", WEEKS);
    });

    after(function () {
        aggregate.__ResetDependency__("WEEKS");
        getNeighbouringDates.__ResetDependency__("WEEKS");
    });

    describe("aggregates readings calculating mean and standard deviation", function () {

        it("with complete data", function () {
            var reading = {
                date: 0,
                podId: "podId",
                type: "attiva",
                value: 50
            };
            var neighbouringReadings = [
                {
                    date: -1209600000,
                    readingId: "podId.-1209600000.attiva",
                    value: 40
                },
                {
                    date: -604800000,
                    readingId: "podId.-604800000.attiva",
                    value: 50
                },
                {
                    date: 604800000,
                    readingId: "podId.604800000.attiva",
                    value: 60
                },
                {
                    date: 1209600000,
                    readingId: "podId.1209600000.attiva",
                    value: 70
                }
            ];
            var expected = [
                {
                    date: 604800000,
                    mean: mean([40, 50, 50]),
                    standardDeviation: standardDeviation([40, 50, 50])
                },
                {
                    date: 1209600000,
                    mean: mean([50, 50, 60]),
                    standardDeviation: standardDeviation([50, 50, 60])
                },
                {
                    date: 1814400000,
                    mean: mean([50, 60, 70]),
                    standardDeviation: standardDeviation([50, 60, 70])
                }
            ];
            var actual = aggregate(reading, neighbouringReadings);
            expect(actual).to.eql(expected);
        });

        it("with incomplete data", function () {
            var reading = {
                date: 0,
                podId: "podId",
                type: "attiva",
                value: 50
            };
            var neighbouringReadings = [
                {
                    date: -1209600000,
                    readingId: "podId.-1209600000.attiva",
                    value: 40
                },
                {
                    date: 604800000,
                    readingId: "podId.604800000.attiva",
                    value: 60
                }
            ];
            var expected = [
                {
                    date: 604800000,
                    mean: mean([40, 50]),
                    standardDeviation: standardDeviation([40, 50])
                },
                {
                    date: 1209600000,
                    mean: mean([50, 60]),
                    standardDeviation: standardDeviation([50, 60])
                },
                {
                    date: 1814400000,
                    mean: mean([50, 60]),
                    standardDeviation: standardDeviation([50, 60])
                }
            ];
            var actual = aggregate(reading, neighbouringReadings);
            expect(actual).to.eql(expected);
        });

    });

});
