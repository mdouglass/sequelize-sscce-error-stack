import { DataTypes, Model } from "sequelize";
import { createSequelize6Instance } from "../setup/create-sequelize-instance";
import { expect } from "chai";
import sinon from "sinon";

// if your issue is dialect specific, remove the dialects you don't need to test on.
export const testingOnDialects = new Set([
  "mssql",
  "sqlite",
  "mysql",
  "mariadb",
  "postgres",
  "postgres-native",
]);

// You can delete this file if you don't want your SSCCE to be tested against Sequelize 6

// Your SSCCE goes inside this function.
export async function run() {
  // This function should be used instead of `new Sequelize()`.
  // It applies the config for your SSCCE to work on CI.
  const sequelize = createSequelize6Instance({
    logQueryParameters: true,
    benchmark: true,
    define: {
      // For less clutter in the SSCCE
      timestamps: false,
    },
  });

  // demonstrate that stack normally has the error message in it
  try {
    throw new Error('hello world')
  } catch (error) {
    const e = error as Error
    expect(e.message).to.equal('hello world')
    expect(e.stack?.split('\n')[0]).to.equal('Error: hello world')
  }

  // intentionally cause a deadlock error (really anything that throws DatabaseError)
  try {
    await sequelize.transaction(async (txnOuter) => {
      await sequelize.transaction(async (txnInner) => {});
    });
  } catch (error) {
    const e = error as Error
    expect(e.message).to.equal('SQLITE_ERROR: cannot start a transaction within a transaction')
    expect(e.stack?.split('\n')[0]).to.equal('SequelizeDatbaseError: SQLITE_ERROR: cannot start a transaction within a transaction')
  }
}
