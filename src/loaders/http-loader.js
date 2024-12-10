
import * as helpers from "ivfflat/src/frontend/utils/helpers.js"
import axios from "axios"

export class HttpLoader 
{
    constructor(context) {
        this.context = context
    }

    async loadVocabulary() {
        const source = this.context.source 
        const response = await axios.get(source + "/vocabulary.txt")
        return response.data.split("\n")
    }

    async loadWordIndex() {
        const source = this.context.source 
        const response = await axios.get(source + "/word-index.json")
        return response.data
    }

    async loadCEFRData() {
        const source = this.context.source 
        const response = await axios.get(source + "/cefr-data.json")
        return response.data
    }

    async loadVectors(dims, onLoadVectors) {
        const source = this.context.source 
        const response = await axios.get(source + "/vectors.norm.bin", {
            responseType :  "arraybuffer",
            onDownloadProgress: onLoadVectors
        })

        let vectors = response.data
        vectors = helpers.decodeBytesToFloatArray(vectors, dims)
        vectors = helpers.partition(vectors, dims)

        return vectors
    }   

    async loadIndexer() {
        const source = this.context.source 
        const response = await axios.get(source + "/indexer.json")
        return response.data
    }
}