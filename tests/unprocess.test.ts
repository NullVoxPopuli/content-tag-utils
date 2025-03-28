import { it, expect } from "vitest";
import { unprocess } from "content-tag-utils/unprocess";
import {
  glimmer,
  implicitDefault,
  multiTemplate,
  unicodeMulti,
  unicodeSingle,
} from "./helpers.js";
import { Preprocessor } from "content-tag";

let p = new Preprocessor();

function normalizeCode(input: string) {
  return input
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

expect.extend({
  toMatchCode(received, expected) {
    let r = normalizeCode(received);
    let e = normalizeCode(expected);

    let isSame = r.length === e.length;

    if (isSame) {
      for (let i = 0; i < r.length; i++) {
        let left = r[i];
        let right = e[i];

        if (left !== right) {
          isSame = false;
          break;
        }
      }
    }

    return {
      pass: isSame,
      message: () => `Expected \n${r.join("\n")} \n\nto be:\n ${e.join("\n")}`,
    };
  },
});

interface CustomMatchers<R = unknown> {
  toMatchCode: (expected: any) => R;
}

declare module "vitest" {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

function doUndo(input: string) {
  let { code } = p.process(input);
  let result = unprocess(code);

  return result;
}

it("implicitDefault.satisfies", async () => {
  expect(doUndo(implicitDefault.satisfies)).toMatchInlineSnapshot(`
    "import type { TOC } from '@ember/component/template-only';
    export default <template>hi there</template> satisfies TOC<{
    }>;
    "
  `);
});

it("implicitDefault.js", async () => {
  expect(doUndo(implicitDefault.js)).toMatchInlineSnapshot(`
    "export default <template>hi</template>;
    "
  `);
});

it("unicodeSingle", () => {
  let result = doUndo(unicodeSingle);

  // @ts-expect-error - how do types for this work
  expect(result).toMatchObject(unicodeSingle);
});

it("unicodeMulti", () => {
  let result = doUndo(unicodeMulti);

  expect(result).toMatchCode(unicodeMulti);
});

it("multiTemplate", () => {
  let result = doUndo(multiTemplate);

  expect(result).toMatchCode(multiTemplate);
});

it("glimmer", () => {
  let result = doUndo(glimmer);

  expect(result).toMatchCode(glimmer);
});
