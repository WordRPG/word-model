import { WordModel } from "../src/word-model.js";

const wordModel = new WordModel(
    "file", 
    "./data/word-models/wordrpg-glove-2024", 
    50,
    1234567890
)

await wordModel.load()

console.log(wordModel.randomWord("A2"))