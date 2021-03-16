"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const git_1 = require("../src/utils/git");
test('test node git', async () => {
    const res = await git_1.Git.testDiscover();
    expect(res);
});
