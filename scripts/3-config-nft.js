import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const bundleDrop = sdk.getBundleDropModule(
  "0x593ae01AA255a5Cb080F452d5a5Aaf4f1350dE24",
);

(async () => {
  try {
    await bundleDrop.createBatch([
      {
        name: "AfroApes Membership card",
        description: "This NFT will give you access to AfroDAO!",
        image: readFileSync("scripts/assets/unnamed.jpg"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})()