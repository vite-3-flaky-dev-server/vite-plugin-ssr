# Vite 3 Flaky Dev Server

Reproduction showcasing that the dev server of `vite@3.0.0-alpha.9` (purposley using an old alpha version) is flaky.

> The bug also exists in `vite@3.0.0-alpha.13`. (Why the reproduction uses `vite@3.0.0-alpha.9` is explained later.)

- [Reproduction](#reproduction)
- [Double Source](#double-source)

## Reproduction

Observe the CI:
 - [branch `vite@2.9.10` is green](https://github.com/vite-3-flaky-dev-server/vite-plugin-ssr/commits/vite@2.9.10).
 - [branch `vite@3.0.0-alpha.9` is red](https://github.com/vite-3-flaky-dev-server/vite-plugin-ssr/commits/vite@3.0.0-alpha.9).

Observe how the only [difference between the two branches](https://github.com/vite-3-flaky-dev-server/vite-plugin-ssr/compare/vite@2.9.10..vite@3.0.0-alpha.9) is the Vite version used.

The "interesting" part here is that all `vite@3.0.0-alpha.9` tests are sometimes failing and sometimes not. In other words: if one were to run the CI over and over again, it would be green once in a while.

The flakiness only happens with tests that use Vite's dev server. All `$ vite build` tests are always green. So something must have changed in Vite's dev server that makes these Vite dev server tests randomly fail. The tests fail for a range of reasons:
 - Jest test timeout
 - `504 (Gateway Timeout)`
 - Vue hydration mismatches
 - Page navigation not working

My guess is that the root cause is Vite's dev server to randomly stop working, which would explain all these errors.

> Note that the commits `re-run CI` are empty commits to trigger the CI. This is to showcase that the `vite@2.9.10` branch is always green whereas `vite@3.0.0-alpha.9` has randomly failing tests.

> This repository is a fork of the vite-plugin-ssr repository. (The reproduction is purposley not minimal to better showcase the flakiness.)


## Double Source

One tricky thing about this issue is that it has two sources: the problem is caused by **both** a Vite change as well as a `vite-plugin-ssr` change.

I know this because there is an old vite-plugin-ssr version that works with `vite@3.0.0-alpha.9` (as showcased by the [branch `vite@3.0.0-alpha.9_old-vite-pugin-ssr-version`](https://github.com/vite-3-flaky-dev-server/vite-plugin-ssr/commits/vite@3.0.0-alpha.9_old-vite-pugin-ssr-version) which is always green).

I plan to fix the situation by searching, and once found, reverting the `vite-plugin-ssr` problematic change. But **fixing this on `vite-plugin-ssr`'s side doesn't really help us**: the Vite problematic change would still be around, looming around the corner to haunt us back (at some point in the future).

That said, even if we want to take a faith of leap (I think we should) by only fixing the problem on `vite-plugin-ssr`'s side, someone familiar with the Vite 3 alphas should be aware about this issue and point us to Vite 3 changes that have potential to be the cause.

Anyways, it's good to have a reproduction for this. Especially since flakiness is hard to reproduce.

Note that the flakiness also happens with `vite@3.0.0-alpha.13` but this reproduction showcases the flakiness with `vite@3.0.0-alpha.9` in order to reduce the Vite search space: for example, since the `127.0.0.1` => `localhost` change was released later, we can safely assume that it's not the culprit.

On Vite's side, the problem is somewhere [between `v2.9.10` and `v3.0.0-alpha.9`](https://github.com/vitejs/vite/compare/v2.9.10..v3.0.0-alpha.9).

On vite-plugin-ssr's side, the problem is somewhere [between `a3a71f` and `408159`](https://github.com/brillout/vite-plugin-ssr/compare/a3a71f40853c36611a60fd48fb71ad41c643eefb..40815954c0babbb5728f7d212c4a0a425795ebef).

Hit me up on discord if you have questions.

> This reproduction lives in its own GitHub organization to keep the repository name `vite-plugin-ssr` which is needed for vite-plugin-ssr's CI.
