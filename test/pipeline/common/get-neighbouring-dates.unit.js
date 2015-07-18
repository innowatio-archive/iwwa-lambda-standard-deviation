import {expect} from "chai";
import {concat, range} from "ramda";
import moment from "moment";

import getNeighbouringDates from "pipeline/common/get-neighbouring-dates";

describe("getNeighbouringDates", function () {

    var WEEKS = 20;

    before(function () {
        getNeighbouringDates.__Rewire__("WEEKS", WEEKS);
    });

    after(function () {
        getNeighbouringDates.__ResetDependency__("WEEKS");
    });

    it("returns an array of neighbouring dates", function () {
        var date = Date.now();
        var before = range(1, WEEKS).map(n => {
            return moment(date).subtract(n, "weeks").valueOf();
        });
        var after = range(1, WEEKS).map(n => {
            return moment(date).add(n, "weeks").valueOf();
        });
        var expected = concat(before, after).sort();
        var actual = getNeighbouringDates(date);
        expect(actual).to.eql(expected);
        expect(actual.length).to.equal((WEEKS - 1) * 2);
    });

});
