import fs from "fs/promises" 
import fs_ from "fs"
import { PointsLoader } from "ivfflat"

// --- setup 
const NAME       = "wordrpg-glove-2024"
const MODEL_NAME = "glove-wiki-gigaword-50"
const MODEL_DIMS = 50

// --- load word vectors
console.log("Loading word vectors.")
const vectors = 
    PointsLoader.load(
        `./data/word-embeddings/${MODEL_NAME}/vectors.norm.bin`, 
        MODEL_DIMS
    )
console.log(`\tShape: (${vectors.length}, ${vectors[0].length}).`)

// --- load vocabulary 
console.log("Loading vocabulary.")
const vocabulary = 
    fs_.readFileSync(
        `./data/word-embeddings/${MODEL_NAME}/vocabulary.txt`
    ).toString().split("\n")
console.log(`\tLoaded ${vocabulary.length} words.`)


// --- create word index
console.log("Creating word index.")
const wordIndex = {} 
for(let i = 0; i < vocabulary.length; i++) {
    wordIndex[vocabulary[i]] = i 
}

// --- load cefr wrods 
console.log("Loading CEFR data.") 
const cefrData = 
    JSON.parse(fs_.readFileSync("./data/cefr/cefr-data.json"))

// --- filtering words with cefr 
console.log("Filtering words with CEFR level.") 
const wordsWithCEFR = new Set() 
for(let word of vocabulary) {
    if(word in cefrData.map) {
        wordsWithCEFR.add(word)
    }
}
console.log(`\tDetected ${wordsWithCEFR.size} words with CEFR.`)

// --- getting filtered CEFR data. 
console.log("Getting filtered CEFR data.") 
const cefrMap = {} 
const cefrGroups = {} 
const cefrCounts = {} 
for(let word of wordsWithCEFR) {
    const cefrStr = cefrData.map[word][0]
    const cefrFloat = cefrData.map[word][1]
    cefrMap[word] = cefrData.map[word] 
    if(!(cefrStr in cefrGroups)) {
        cefrGroups[cefrStr] = {} 
        cefrCounts[cefrStr] = 0
    }
    cefrCounts[cefrStr] += 1 
    cefrGroups[cefrStr][word] = cefrFloat
}
const truncatedCEFRData = {
    map : cefrMap,
    groups : cefrGroups,
    counts : cefrCounts
}

// --- tally CEFR counts 
console.log("Tallying CEFR counts.")
for(let level in cefrCounts) {
    console.log(`\t${level} = ${cefrCounts[level]}`)
}

// --- truncate vocabulary 
console.log("Truncating vocabulary.")
const truncatedVocabulary = [...wordsWithCEFR]
console.log(`\tFiltered ${truncatedVocabulary.length}`)

// --- filter vectors
console.log("Filtering vectors.")
const truncatedVectors = truncatedVocabulary.map(word => vectors[wordIndex[word]])
console.log(`\tFiltered ${truncatedVectors.length}`)

// --- save to files
console.log("Saving to files.")

if(fs_.existsSync(`./data/word-models/${NAME}`)) {
    await fs.rm(`./data/word-models/${NAME}`, { recursive: true })
}
await fs.mkdir(`./data/word-models/${NAME}`)

console.log("\tSaving vocabulary.")
fs_.writeFileSync(
    `./data/word-models/${NAME}/vocabulary.txt`, 
    truncatedVocabulary.join("\n")
)

console.log("\tSaving word index.")
fs_.writeFileSync(
    `./data/word-models/${NAME}/word-index.json`, 
    JSON.stringify(wordIndex)
)

console.log("\tSaving CEFR data.")
fs_.writeFileSync(
    `./data/word-models/${NAME}/cefr-data.json`, 
    JSON.stringify(truncatedCEFRData)
)

console.log("\tSaving vectors data.")
PointsLoader.save(
    `./data/word-models/${NAME}/vectors.bin`,
    truncatedVectors,
    50
  
)