# Contributing

Dataform is a TypeScript project, using [Bazel](https://bazel.build) as a build tool. To scope out work, please [check existing issues (which includes feature requests)](https://github.com/dataform-co/dataform/issues) or [open a discussion thread](https://github.com/dataform-co/dataform/discussions)!

## Getting Started

First :fork_and_knife: [fork this repository](https://github.com/dataform-co/dataform/fork), clone it to your desktop, and navigate within.

### Requirements

#### [Bazel](https://bazel.build)

Bazel is a build system which we used to build the project and run tests.

The easiest way to install the correct Bazel version is through Bazelisk via [NPM](https://nodejs.org/en/download/):

```
npm i -g @bazel/bazelisk
```

### Run the CLI

You can run the project as you would the `npm` installation of `@dataform/cli`, but replace `dataform` with `./scripts/run`.

For example, to print out the default help information:

```bash
./scripts/run help
```

Check the [docs](https://cloud.google.com/dataform/docs/reference/dataform-cli-reference) for more examples.

_Note: If you are running Bazel on a **Mac**, this or any step that requires building may fail with a `Too many open files in system` error. This is [due to a limitation](https://github.com/angular/angular-bazel-example/issues/178) on the default maximum open file descriptors. You can increase the limit by running `sudo sysctl -w kern.maxfiles=<LARGE_NUMBER>` (we use `65536`)._

### Test

The following command runs tests for @dataform/core:

```bash
bazel test //core/...
```

If you need to run integration tests, that rely on encrypted secrets, please [get in touch](mailto:opensource@dataform.co) with the team.

### Lint

The following command to check for any linting errors

```bash
./scripts/lint
```

### Building

Building the CLI will build most of the required components.

```bash
bazel build cli
```

The projects folder here is not built as it requires an environment file, which can be provided from the team.

### Add New NPM Dependencies

Global yarn installations will throw errors when installing packages, instead you should use:

```bash
$ bazel run @nodejs//:yarn add ...
```

Additionally, installed NPM dependencies need to be added to the `deps` of `ts_library` rules by
prefixing them with `@npm//...`.

## The Contribution Process

1. Decide on what you'd like to contribute. The majority of open-source contributions come from:

   1. Someone deciding they want a feature that is not currently present, and which isn't a priority for the team.

   1. Embracing the community aspect of open source (or getting that commit count up) and solving an issue.

1. Plan out the change, and whether it is feasible.

   1. If you're unsure of the scope of the change, then ask in the issue or [create a discussion](https://github.com/dataform-co/dataform/discussions).

   1. We'd much prefer multiple smaller code changes than a single large one.

   1. Avoid changing core functionality over a long time frame. Our development process is very dynamic, so if your code depends on lots of other parts of the project, then it is likely to be out of date by the time you finish!

   1. If you're solving an issue, be sure to comment to make it known that you are currently solving it. Unless we have worked with you before, it is unlikely that we will lock the issue to you.

1. Begin materialising your masterpiece.

   1. Create a feature branch based on `main` ([link](https://github.com/dataform-co/dataform/tree/main)) for development work.

1. Once done, review your code, run the tests, **[check for common mistakes](#common-pull-request-mistakes)** and then open a pull request.

   1. Tidy the code by removing erronous log statements. Comment difficult to interpret sections. Make sure functions are names appropriately. We will review the pull request mainly by the git difference.

   1. Assign a reviewer. Pick anyone on the team who seems to contribute a lot and they will refer it onto whoever is most responsible for the given subsystem.

1. Discuss and process any changes requested.

   1. It's unlikely your pull request will be perfect immediately; there will likely be some changes requested, whether it's to do with style or a more fundamental issue.

   1. The automated integration tests must pass.

   1. Once a pull request is accepted and all automated integration tests are passing, we will merge it for you.

### Reporting Issues (!)

Another way we'd love for you to contribute is by flagging any issues you find. First check through the list of [existing issues](https://github.com/dataform-co/dataform/issues) for anything similar, in order to avoid duplicates. If not, then full steam ahead!

### Promoting Dataform

If you're using Dataform for interesting projects then please let people know! Reach out to [dataform-preview@google.com](dataform-preview@google.com) for marketing support.

### Common Pull Request Mistakes

1. Is it too long? Small pull requests are easier to review and merge. If you are planning on making a larger change, then talk to the team and write a document on the design.

1. Have you appropriately increased test coverage? If the operation of the change is not already tested, then tests will need to be written.

1. Is it a hack? Does it solve the problem, but it is not reliable, reproducable or extendable? In other words, [does it smell](https://en.wikipedia.org/wiki/Code_smell)?

1. Have you changed whitespace or touched unrelated code? Please avoid this as it makes pull requests far more difficult to review.

1. Are the comments useful, and is the code readable? Are the function and variable names appropriate?
