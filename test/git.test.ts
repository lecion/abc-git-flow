import {Git} from '../src/utils/git';
import NodeGit from 'nodegit';
import * as Tag from '../src/actions/tag';

test('test node git', async () => {
   const repository = await Git.discoverRepository();
   const res =  await Git.initFlow(repository);
   expect(res);
})

test('test NodeGit', async () => {
   const repo = await Git.discoverRepository();

   const currentBranch = await repo.getCurrentBranch();
   console.log(currentBranch.shorthand() === 'master');

   try {
      const branch = await NodeGit.Branch.lookup(repo, 'gray', NodeGit.Branch.BRANCH.LOCAL);

      console.info('branch', branch)
   }catch (e) {
      console.error(e);
      // let commit = null;
      // try {
      //    commit = await repo.getBranchCommit(`refs/remotes/origin/gray`);
      //    await repo.createBranch('gray', commit);
      // }catch (e) {
      //
      // }
   }


   // await repo.checkoutBranch('gray');
})

// test('test tag config', async () => {
//    const res = await Tag.getTagConfig();
//    const startYear = 2019;
//    const currentYear = new Date().getFullYear();
//
//    const version = (currentYear - startYear) + 1;
//
//
//    if (res) {
//       const {prefix} = res;
//       await Tag.checkMajorVersion();
//       console.log('prefix', prefix, 'major', version);
//    }
//    expect(res);
// })
