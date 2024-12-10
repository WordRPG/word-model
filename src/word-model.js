
import { FileSystemLoader } from "./loaders/fs-loader.js" 
import { HttpLoader } from "./loaders/http-loader.js"
import { IVFFlat, BruteForceNNS } from "ivfflat"
import { Point } from "ivfflat"
import { Random } from "ivfflat/src/frontend/utils/random.js"
import { centroid } from "ivfflat/src/frontend/utils/operations.js"
import { cosineSimilarity } from "ivfflat/src/frontend/utils/operations.js"

export class WordModel 
{
    constructor(method = "file", source, dims = 50, randomState = 1234567890) {
        this.method = method 
        this.source = source
        this.dims = dims
        this.randomState = randomState 
        this.probeCount = 150
        this.setupRandomGenerator()
        this.setupLoader()

        // --- components --- //
        this.vocabulary = [] 
        this.wordIndex  = {}
        this.vectors    = []
        this.cefrData   = [] 
        this.approx     = null
        this.exact      = null
    }

    setupLoader() {
        if(this.method == "file") {
            this.loader = new FileSystemLoader(this)
        }
        else if(this.method == "http") {
            this.loader = new HttpLoader(this)
        }
        else {
            this.loader = this.method
        }
    }

    async load({ 
        onLoadVectors = null,
        onProgress = (perc, message) => console.log(perc, message)
    } = {}) {   
        let self = this
        const progressItems = [
            async (perc) => {
                onProgress && onProgress(perc, "loading.vocabulary")
                self.vocabulary = await self.loader.loadVocabulary()
            }, 
            async (perc) => {
                onProgress && onProgress(perc, "loading.word-index")
                self.wordIndex = await self.loader.loadWordIndex()
            },
            async (perc) => {
                onProgress && onProgress(perc, "loading.cefr-data")
                self.cefrData = await self.loader.loadCEFRData()
            }, 
            async (perc) => {
                onProgress && onProgress(perc, "loading.vectors")
                self.vectors = await self.loader.loadVectors(
                    this.dims, 
                    onLoadVectors
                )
                self.vectors = self.vectors.map((vector, index) => {
                    return new Point(index, vector)
                })
            },
            async (perc) => {
                onProgress && onProgress(perc, "loading.indexers")
                const source = await self.loader.loadIndexer()
                self.approx = new IVFFlat(source)
                self.approx.points = self.vectors
                self.exact  = new BruteForceNNS(source)
                self.exact.points = self.vectors
            }
        ]

        let total = progressItems.length
        for(let i = 0; i < progressItems.length; i++) {
            const item = progressItems[i]
            await item(i / total)
        }
    }

    word(wordIndex) {
        return this.vocabulary[wordIndex]
    }

    index(word) {
        return this.wordIndex[word]
    }
    
    size() {
        return this.vocabulary.length
    }

    setupRandomGenerator() {
        this.random = new Random(this.randomState)
    }

    randomWord() {
        const randomIndex = this.random.randInt(0, this.size() - 1)
        return [
            randomIndex,
            this.vocabulary[randomIndex]
        ]
    }

    vector(index) {
        return this.vectors[index]
    }
    
    vectorOfWord(word) {
        return this.vector(this.index(word))
    }

    centroid(vectors) {
        return centroid(vectors)
    }

    centroidOfWords(words) {
        let self = this 
        return this.centroid(words.map(word => self.vectorOfWord(word)))
    }

    nearest(vector, k = 10, driver = (s) => s.approx) {
        return driver(this).nearest(vector, k, this.probeCount)
    }

    farthest(vector, k = 10, driver = (s) => s.approx) {
        return driver(this).farthest(vector, k, this.probeCount)
    }

    nearestWords(vector, k = 10, driver = (s) => s.approx) {
        const results = this.nearest(vector, k, driver)
        const finalResults = []
        for(let i = 0; i < results[0].length; i++) {
            const result = []
            result.push(this.vocabulary[results[0][i]])
            result.push(results[0][i]) 
            result.push(results[1][i])
            finalResults.push(result)
        }
        return finalResults
    }

    farthestWords(vector, k = 10, driver = (s) => s.approx) {
        const results = this.farthest(vector, k, driver)
        const finalResults = []
        for(let i = 0; i < results[0].length; i++) {
            const result = []
            result.push(this.vocabulary[results[0][i]])
            result.push(results[0][i]) 
            result.push(results[1][i])
            finalResults.push(result)
        }
        return finalResults
    }

    similarityScore(vectorA, vectorB) {
        return (cosineSimilarity(vectorA, vectorB) + 1) / 2
    }

}