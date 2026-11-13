import { novaGroup, nutriScoreGrade } from "../foodGrades";

describe("nutriScoreGrade", () => {
  it("citeste literele a–e, indiferent de majuscule", () => {
    expect(nutriScoreGrade({ nutriscore_grade: "a" })).toBe("a");
    expect(nutriScoreGrade({ nutriscore_grade: "D" })).toBe("d");
  });

  it("nu inventeaza o nota cand OFF nu are una", () => {
    expect(nutriScoreGrade({ nutriscore_grade: "unknown" })).toBeNull();
    expect(nutriScoreGrade({ nutriscore_grade: "not-applicable" })).toBeNull();
    expect(nutriScoreGrade({})).toBeNull();
    expect(nutriScoreGrade(null)).toBeNull();
  });
});

describe("novaGroup", () => {
  it("accepta grupa ca numar sau ca text", () => {
    expect(novaGroup({ nova_group: 4 })).toBe(4);
    expect(novaGroup({ nova_group: "1" })).toBe(1);
  });

  it("ignora valorile din afara 1–4", () => {
    expect(novaGroup({ nova_group: 0 })).toBeNull();
    expect(novaGroup({ nova_group: 5 })).toBeNull();
    expect(novaGroup({ nova_group: "" })).toBeNull();
    expect(novaGroup({})).toBeNull();
  });
});
