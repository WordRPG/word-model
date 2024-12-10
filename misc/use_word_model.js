import { WordModel } from "../src/word-model.js";

const wordModel = new WordModel(
    "http", 
    "http://127.0.0.1:8000/data/word-models/wordrpg-glove-2024", 
    50,
    1234567890
)

await wordModel.load()

console.log(
    wordModel.nearestWords(
        wordModel.vectorOfWord("food"), 
        100
    )
)