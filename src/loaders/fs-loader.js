
import { PointsLoader } from "ivfflat"

export class FileSystemLoader 
{
    constructor(context) {
        this.context = context
    }

    async loadVocabulary() {
        const fs = (await import("fs")).default
        const source = this.context.source 
        return fs.readFileSync(source + "/vocabulary.txt").toString().split("\n") 
    }

    async loadWordIndex() {
        const fs = (await import("fs")).default
        const source = this.context.source 
        return JSON.parse(fs.readFileSync(source + "/word-index.json"))
    }

    async loadCEFRData() {
        const fs = (await import("fs")).default
        const source = this.context.source 
        return JSON.parse(fs.readFileSync(source + "/cefr-data.json"))
    }

    async loadVectors(dims, onLoadVectors) {
        const source = this.context.source 
        return PointsLoader.load(
            source + "/vectors.norm.bin",
            dims,  
            { onLoadPoints: onLoadVectors }
        )
    }

    async loadIndexer() {
        const fs = (await import("fs")).default
        const source = this.context.source 
        return JSON.parse(fs.readFileSync(source + "/indexer.json"))
    }
}