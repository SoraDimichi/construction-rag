import { XMLParser } from "fast-xml-parser";
import c from "cyrillic-to-translit-js";
import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import { readFileSync } from "fs";
import { join, extname, basename } from "path";

const xmlFolder = "./xml";
const jsonFolder = "./json";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  allowBooleanAttributes: true,
  parseAttributeValue: true,
});

// const buildCodeMapAll = (data: any): Record<string, string> => {
//   const result: Record<string, string> = {};
//   const traverse = (node: any, parentBeginName: string) => {
//     const currentBeginName =
//       typeof node?.BeginName === "string" ? node.BeginName : parentBeginName;
//     if (Array.isArray(node?.Work)) {
//       node.Work.forEach((item: any) => {
//         result[item.Code] =
//           (currentBeginName ? currentBeginName + " " : "") +
//           (item.EndName || "");
//       });
//     }
//     Object.values(node || {})
//       .filter((value) => typeof value === "object")
//       .forEach((value) => {
//         if (Array.isArray(value)) {
//           value.forEach((inner) => traverse(inner, currentBeginName));
//         } else {
//           traverse(value, currentBeginName);
//         }
//       });
//   };
//   traverse(data, "");
//   return result;
// };

const buildTableMap = (sourceData: any): Record<string, string> => {
  const resultMap: Record<string, string> = {};
  const diveNode = (node: any) => {
    if (node && typeof node === "object") {
      if (node.Type === "Таблица") {
        resultMap[node.Code] = node.Name;
      }
      Object.values(node).forEach((value) => {
        if (value && typeof value === "object") {
          Array.isArray(value) ? value.forEach(diveNode) : diveNode(value);
        }
      });
    }
  };
  diveNode(sourceData);
  return resultMap;
};

mkdir(jsonFolder, { recursive: true })
  .then(() =>
    readdir(xmlFolder)
      .then((files) =>
        files.filter((file) => extname(file).toLowerCase() === ".xml"),
      )
      .then((xmlFiles) =>
        Promise.all(
          xmlFiles.map((file) =>
            readFile(join(xmlFolder, file), "utf8")
              .then((xml) => parser.parse(xml))
              .then((json) => {
                return writeFile(
                  join(jsonFolder, `${basename(file, ".xml")}.json`),
                  JSON.stringify(buildTableMap(json)),
                );
              }),
          ),
        ),
      )
      .then(() => readdir(jsonFolder))
      .then((foundFiles) =>
        foundFiles.filter(
          (singleFile) =>
            extname(singleFile).toLowerCase() === ".json" &&
            !singleFile.startsWith("._"),
        ),
      )
      .then((jsonFiles) =>
        jsonFiles.reduce((collected, singleJsonFile) => {
          const parsed = JSON.parse(
            readFileSync(join(jsonFolder, singleJsonFile), "utf8"),
          );

          if (!Object.keys(parsed).length) return collected;

          const updated = Object.entries(parsed).reduce(
            (result, [theKey, theValue]) => {
              return {
                ...result,
                [c().transform(basename(singleJsonFile, ".json")).toLowerCase() +
                "-" +
                theKey]: theValue,
              };
            },
            {},
          );

          return { ...collected, ...updated };
        }, {}),
      )
      .then((finalResult) =>
        writeFile(join("./", "result.json"), JSON.stringify(finalResult)),
      )
  )
  .catch(console.error);
