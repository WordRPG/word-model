from cefrpy import CEFRAnalyzer, CEFRLevel 
import json


# --- initialize CEFR analyzer 
print("Initializing CEFR analyzer.")
analyzer = CEFRAnalyzer() 

# --- get list of all words 
print("Getting list of all words.")
words = list(analyzer.yield_words())
print(f"\tDetected {len(words)} words.")


# --- map words to cefr level 
cefr_counts  = {}
cefr_map     = {}
cefr_groups  = {}
print("Mapping words to CEFR levels.")
for word in words: 
    cefr_str    = str(analyzer.get_average_word_level_CEFR(word))
    cefr_float  = analyzer.get_average_word_level_float(word)
    
    if cefr_str not in cefr_counts:
        cefr_counts[cefr_str] = 0 
        cefr_groups[cefr_str] = {}

    cefr_counts[cefr_str] += 1 
    cefr_groups[cefr_str][word] = cefr_float
    cefr_map[word] = [cefr_str, cefr_float]

# --- tally cefr counts 
print("Tallying CEFR counts.")
for level in cefr_counts: 
    print(f"\t{level} = {cefr_counts[level]}")

# --- saving cefr data 
print("Saving CEFR data.")
cefr_data = {
    "map" : cefr_map, 
    "groups" : cefr_groups, 
    "counts" : cefr_counts
}
json.dump(cefr_data, open("./data/cefr/cefr-data.json", "w"))