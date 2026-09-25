import { OFF_USER_AGENT, APP_NAME, APP_VERSION } from "../userAgent";

// Open Food Facts cere formatul `NumeApp/Versiune (contact)` și poate bloca
// pe IP aplicațiile care nu se prezintă. Testul păzește exact acel format.
describe("User-Agent pentru Open Food Facts", () => {
  it("respectă formatul cerut: NumeApp/Versiune (contact)", () => {
    expect(OFF_USER_AGENT).toMatch(/^[A-Za-z][\w.-]*\/\d+\.\d+(\.\d+)? \(\S+@\S+\.\S+\)$/);
  });

  it("are un e-mail de contact, nu o adresă de site", () => {
    const contact = OFF_USER_AGENT.slice(OFF_USER_AGENT.indexOf("(") + 1, -1);
    expect(contact).toContain("@");
    expect(contact).not.toMatch(/^https?:/);
  });

  it("poartă numele și versiunea aplicației", () => {
    expect(APP_NAME).toBe("Zelynta");
    expect(APP_VERSION).toMatch(/^\d+\.\d+(\.\d+)?$/);
    expect(OFF_USER_AGENT.startsWith(`${APP_NAME}/${APP_VERSION} `)).toBe(true);
  });
});
