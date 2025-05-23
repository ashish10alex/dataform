import { verifyObjectMatchesProto, VerifyProtoErrorBehaviour } from "df/common/protos";
import { ActionBuilder } from "df/core/actions";
import { Resolvable } from "df/core/contextables";
import * as Path from "df/core/path";
import { Session } from "df/core/session";
import {
  actionConfigToCompiledGraphTarget,
  checkAssertionsForDependency,
  configTargetToCompiledGraphTarget,
  nativeRequire,
  resolveActionsConfigFilename
} from "df/core/utils";
import { dataform } from "df/protos/ts";

/**
 * Notebooks run Jupyter Notebook files, and can output content to the storage buckets defined in
 * `workflow_settings.yaml` files.
 *
 * You can create notebooks in the following ways. Available config options are defined in
 * [NotebookConfig](configs#dataform-ActionConfig-NotebookConfig), and are shared across all the
 * following ways of creating notebooks.
 *
 * **Using action configs files:**
 *
 * ```yaml
 * # definitions/actions.yaml
 * actions:
 * - notebook:
 *   filename: name.ipynb
 * ```
 *
 * ```ipynb
 * # definitions/name.ipynb
 * { "cells": [] }
 * ```
 *
 * **Using the Javascript API:**
 *
 * ```js
 * // definitions/file.js
 * notebook("name", { filename: "name.ipynb" })
 * ```
 *
 * ```ipynb
 * # definitions/name.ipynb
 * { "cells": [] }
 * ```
 */
export class Notebook extends ActionBuilder<dataform.Notebook> {
  /** @hidden Hold a reference to the Session instance. */
  public session: Session;
  /**
   * @hidden If true, adds the inline assertions of dependencies as direct dependencies for this
   * action.
   */
  public dependOnDependencyAssertions: boolean = false;

  /**
   * @hidden Stores the generated proto for the compiled graph.
   */
  private proto = dataform.Notebook.create();

  /** @hidden */
  constructor(session?: Session, unverifiedConfig?: any, configPath?: string) {
    super(session);

    const config = this.verifyConfig(unverifiedConfig);

    if (!config.name) {
      config.name = Path.basename(config.filename);
    }
    const target = actionConfigToCompiledGraphTarget(config);
    config.filename = resolveActionsConfigFilename(config.filename, configPath);

    this.session = session;
    this.proto.target = this.applySessionToTarget(target, session.projectConfig, config.filename, {
      validateTarget: true
    });
    this.proto.canonicalTarget = this.applySessionToTarget(target, session.canonicalProjectConfig);
    this.proto.tags = config.tags;
    this.dependOnDependencyAssertions = config.dependOnDependencyAssertions;
    if (config.dependencyTargets) {
      this.dependencies(
        config.dependencyTargets.map(dependencyTarget =>
          configTargetToCompiledGraphTarget(dataform.ActionConfig.Target.create(dependencyTarget))
        )
      );
    }
    this.proto.fileName = config.filename;
    if (config.disabled) {
      this.proto.disabled = config.disabled;
    }

    const notebookContents = nativeRequire(config.filename).asJson;
    this.proto.notebookContents = JSON.stringify(
      stripNotebookOutputs(notebookContents, config.filename)
    );
  }

  /**
   * Sets or overrides the contents of the notebook to run. Not recommended in general; using
   * separate `.ipynb` files for notebooks is preferred.
   */
  public ipynb(contents: object): Notebook {
    this.proto.notebookContents = JSON.stringify(contents);
    return this;
  }

  /** @hidden */
  public dependencies(value: Resolvable | Resolvable[]) {
    const newDependencies = Array.isArray(value) ? value : [value];
    newDependencies.forEach(resolvable => {
      const dependencyTarget = checkAssertionsForDependency(this, resolvable);
      if (!!dependencyTarget) {
        this.proto.dependencyTargets.push(dependencyTarget);
      }
    });
    return this;
  }

  /** @hidden */
  public getFileName() {
    return this.proto.fileName;
  }

  /** @hidden */
  public getTarget() {
    return dataform.Target.create(this.proto.target);
  }

  /** @hidden */
  public compile() {
    return verifyObjectMatchesProto(
      dataform.Notebook,
      this.proto,
      VerifyProtoErrorBehaviour.SUGGEST_REPORTING_TO_DATAFORM_TEAM
    );
  }

  /**
   * @hidden Verify config checks that the constructor provided config matches the expected proto
   * structure.
   */
  private verifyConfig(unverifiedConfig: any): dataform.ActionConfig.NotebookConfig {
    return verifyObjectMatchesProto(
      dataform.ActionConfig.NotebookConfig,
      unverifiedConfig,
      VerifyProtoErrorBehaviour.SHOW_DOCS_LINK
    );
  }
}

/** @hidden Removes all notebook cell outputs. */
function stripNotebookOutputs(
  notebookAsJson: { [key: string]: unknown },
  path: string
): { [key: string]: unknown } {
  if (!("cells" in notebookAsJson)) {
    throw new Error(`Notebook at ${path} is invalid: cells field not present`);
  }
  (notebookAsJson.cells as Array<{ [key: string]: unknown }>).forEach((cell, index) => {
    if ("outputs" in cell) {
      cell.outputs = [];
      (notebookAsJson.cells as Array<{ [key: string]: unknown }>)[index] = cell;
    }
  });
  return notebookAsJson;
}
