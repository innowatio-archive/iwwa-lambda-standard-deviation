import {expect} from "chai";

import buildPodReadingKey from "pipeline/common/build-pod-reading-key";

describe("buildPodReadingKey", function () {

    it("builds a key from a podReading object", function () {
        var podReading = {
            date: 0,
            podId: "podId",
            type: "attiva"
        };
        var expected = "podId.0.attiva";
        var actual = buildPodReadingKey(podReading);
        expect(actual).to.equal(expected);
    });

});
