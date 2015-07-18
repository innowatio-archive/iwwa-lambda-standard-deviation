var SEPARATOR = ".";

export default function buildPodReadingKey ({date, podId, type}) {
    return [podId, date, type].join(SEPARATOR);
}
