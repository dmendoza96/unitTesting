const unitTestingTask = require("../unitTestingTask.js");
const timezoneMock = require("timezone-mock");

describe("unitTestingTask", () => {
  let testDate;

  beforeEach(() => {
    unitTestingTask.lang("en");
    jest.useFakeTimers("modern");
    jest.setSystemTime(new Date("2023-07-23T15:30:10.100"));
    testDate = new Date();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("should throw errors when invalid data is provided", () => {
    expect(() => unitTestingTask()).toThrow(
      "Argument `format` must be a string"
    );
    expect(() => unitTestingTask(123)).toThrow(
      "Argument `format` must be a string"
    );
    expect(() => unitTestingTask("YYYY-MM-DD", {})).toThrow(
      "Argument `date` must be instance of Date or Unix Timestamp or ISODate String"
    );
  });

  test("en should be default lenguage", () => {
    expect(unitTestingTask.lang()).toBe("en");
  });

  test("should change the language to be", () => {
    unitTestingTask.lang("be");
    expect(unitTestingTask.lang()).toBe("be");
  });

  test("should register a new formatter and use it for formatting", () => {
    const formatterName = "NewFormat";
    const formatter = unitTestingTask.register(formatterName, "YYYY-MM");
    expect(formatter(testDate)).toBe("2023-07");
    expect(unitTestingTask.formatters()).toContain(formatterName);
  });

  test("should use a format already registered", () => {
    expect(unitTestingTask("ISOTime", testDate)).toBe("03:30:10");
  });

  test("should use current date when no date is provided", () => {
    const formattedDate = unitTestingTask("YYYY-MM-dd");
    expect(formattedDate).toBe("2023-07-23");
  });

  test("should create object date when ISODate String", () => {
    const ISODate = "2023-07-23T15:30:10.100";
    expect(unitTestingTask("YYYY-MM-dd", ISODate)).toBe("2023-07-23");
  });

  describe("unitTestingTask tokens", () => {
    const datePM = new Date("2023-07-23T15:30:10.100");
    const dateAM = new Date("2023-07-23T00:30:10.100");

    const tokensTestData = [
      ["YYYY", datePM, "2023"],
      ["YY", datePM, "23"],
      ["MMMM", datePM, "July"],
      ["MMM", datePM, "Jul"],
      ["MM", datePM, "07"],
      ["M", datePM, "7"],
      ["DDD", datePM, "Sunday"],
      ["DD", datePM, "Sun"],
      ["D", datePM, "Su"],
      ["dd", datePM, "23"],
      ["d", datePM, "23"],
      ["HH", datePM, "15"],
      ["H", datePM, "15"],
      ["hh", datePM, "03"],
      ["h", datePM, "3"],
      ["mm", datePM, "30"],
      ["m", datePM, "30"],
      ["ss", datePM, "10"],
      ["s", datePM, "10"],
      ["ff", datePM, "100"],
      ["f", datePM, "100"],
      ["A", datePM, "PM"],
      ["a", datePM, "pm"],
      ["A", dateAM, "AM"],
      ["a", dateAM, "am"],
      ["hh", dateAM, "12"],
      ["h", dateAM, "12"],
    ];

    test.each(tokensTestData)(
      "%s token and date %s should return %s",
      (token, date, expected) => {
        expect(unitTestingTask(token, date)).toEqual(expected);
      }
    );
  });

  test("ZZ and Z tokens should return correct negative timezone offset", () => {
    timezoneMock.register("US/Pacific");
    expect(unitTestingTask("ZZ", new Date())).toBe("-0700");
    expect(unitTestingTask("Z", new Date())).toBe("-07:00");
    timezoneMock.unregister();
  });

  test("ZZ and Z tokens should return correct positive timezone offset", () => {
    timezoneMock.register("Europe/London");
    expect(unitTestingTask("ZZ", new Date())).toBe("+0100");
    expect(unitTestingTask("Z", new Date())).toBe("+01:00");
    timezoneMock.unregister();
  });
});
