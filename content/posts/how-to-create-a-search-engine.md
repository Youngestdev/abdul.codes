--- 
title: "How To Build A Search Engine
description: "In this article, we'll cover the basics of building a search engine"
date: 2023-07-23
---

# How to build a vertical search engine

A search engine is a program designed to retrieve information matching a supplied search term from a list of records or a database.

A vertical search engine is a type of search engine designed for the retrieval of information specific to a particular niche. The vertical search engine is employed in information retrieval systems and differs from a horizontal search engine which is designed for a wider range of information.

## Components of a search engine

A search engine ( and by extension, a vertical search engine ) comprises three components:

- crawler
- indexer
- query processor

A search engine is dependent on the aforementioned components, who work hand-in-hand to provide specific functions. I’ve outlined briefly what the components do below:

### Crawler

A crawler is responsible for pulling data from a defined source e.g. RSS feeds. This is usually the first operation a search engine program conducts - crawling data from defined sources. The data is crawled at given intervals which may sometimes be minutes, weeks or months.

### Query Processor

This is the most significant operation in a search engine. A query processor is responsible for translating a term supplied to the search engine to return accurate results. We’re focused on preprocessing operations such:

- Tokenization: Split the text into individual words or tokens.
- Lowercasing: Convert all words to lowercase to ensure case-insensitive search.
- Removing stopwords: Filter out common words (e.g., "and," "the," "is") that do not contribute much to the meaning of the text.
- Stemming: Reduce words to their base or root form to improve search recall.
- Ranking: The ranking process involves assigning scores or weights to the documents based on factors like term frequency, inverse document frequency, and other relevancy measures.

### Indexer

An indexer is responsible for storing data pulled by the crawler into a systematic order to allow for the easy location of data. The working principle of an indexer is to create an **********index********** which serves as a store for a collection of data as well as holding links to stored records - this is called indexing.

### What is an index?

An index data structure is a system or method used to efficiently organize and retrieve information from a large dataset. It serves as a reference or roadmap that allows quick access to specific data elements, reducing the time complexity of searching and retrieval operations.

In the context of text search and information retrieval, such as in databases or search engines, an index data structure is often used to facilitate fast searching of words, phrases, or other patterns within a corpus of documents. The index data structure typically consists of the following components:

1. **Terms/Keys**: These are the words or phrases from the documents that need to be indexed. Each unique term serves as a key in the index data structure.
2. **Postings/Inverted Lists**: For each term, there is a list of documents or locations where the term appears. This list is called a "posting" or "inverted list." The inverted list contains references to the documents or positions where the term occurs, enabling efficient retrieval of relevant documents during searches.
3. **Term Frequencies**: In some cases, the index may include information about the frequency of each term in a document. This can be used to rank the relevance of documents in search results or for other statistical purposes.
4. **Document Information**: Additional metadata about the documents, such as document IDs, titles, or other attributes, may be included in the index data structure for quicker identification and retrieval.

The choice of the specific index data structure depends on the application and the requirements for search efficiency and space utilization. Common index data structures include:

- **Inverted Index**: A widely used data structure for text search, where terms are mapped to their respective postings (lists of documents containing those terms).
- **B-trees**: A balanced tree data structure commonly used for indexing in databases, providing efficient search, insert, and delete operations.
- **Hash Tables**: Another data structure that enables fast key-based access to information, suitable for cases where exact matching is required.

The design and implementation of an index data structure are crucial for optimizing search performance and providing a smooth user experience in various information retrieval systems.

## Building  the search engine

The operation of the search engine is: **submit a query → process the query → return results**. Remember that there are three components of the search engine explained in the previous section. **In place of building an actual crawler, the indexer will be built on sample data generated by Faker. Let’s move on to build a query processor.**

- In this section, I’ll be focusing more on writing the actual code and less theory. The fundamental working principles of each of the functions involved have been discussed and will be summarily explained via code comments.

### Building a query processor

The query processor will make use of the natural language toolkit library `nltk` for word lemmatization and stopwords removal as well as necessary toolkit data `punkt` for tokenization and `wordnet` for, `pickle` to serialize, save and load the inverted index into and from the inverted index file `index`. 

```python
import nltk
import pickle

from collections import defaultdict
from nltk.stem import WordNetLemmatizer

nltk.download('punkt')
nltk.download('wordnet')
```

### Lemmatization

Lemmatization is the process of reducing a word to its base form. For example, the word `eating` when lemmatized is transformed to its base verb form `eat`. This will be the first function defined in our search engine. The lemmatization will be carried out using nltk’s `WordNetLemmatizer` method:

```python
def lemmatization(word: str):
    lemmatizer = WordNetLemmatizer()
    result = lemmatizer.lemmatize(word)
    return result
```

### Tokenization and stopwords removal

Let’s write out the function to handle the other tasks for the query processing. In this function, we’ll include the lemmatization function as well. Let’s call this function `preprocess`:

```python
def preprocess(text):
    tokens = nltk.word_tokenize(text)

    tokens = [lemmatization(token) for token in tokens]

    # Remove stopwords
    stopwords = nltk.corpus.stopwords.words("english")
    tokens = [token for token in tokens if token not in stopwords]

    # Remove punctuation
    tokens = [token for token in tokens if token.isalnum()]

    processed_text = " ".join(tokens)

    return processed_text
```

The last functions involved in the processing is the ranking functions. These functions are responsible for calculating the relevance of the document to the given search query. For this search engine, we’ll make use of the [TF-IDF (Term Frequency-Inverse Document Frequency) formula](https://www.capitalone.com/tech/machine-learning/understanding-tf-idf/).

The term frequency formula is defined as:

$$
TF(t,d) = x \div N
$$

where:

- ***x*** is the number of times a term *t* appears in the document **d**
- ***N*** is the total number of terms in document ***d***

The inverse document frequency formula is defined as:

$$
IDF(t) = log(N\div Y)
$$

where:

- ***N*** is the total number of documents
- ***Y*** is the number of documents containing term ***t***

The combination TF-IDF formula is defined as:

$$
TF-IDF(t,d) = TF(t,d) \div IDF(t))
$$

Beneath the `preprocess` function, let’s add the functions to calculate TF-IDF and IDF. The term frequency will be computed in the search function when a query is supplied. In the meantime, the functions are defined:

```python
import math

**...** 

def calculate_tf_idf(tf, idf):
    return tf * idf

def calculate_idf(word, inverted_index, total_docs):
    doc_frequency = len(inverted_index[word])
    if doc_frequency == 0:
        return 0
    return math.log(total_docs / doc_frequency)
```

### Indexing

The index is built from an existing chunk of document. For this article, I have collected sample data generated via Faker. 

Let’s start by writing a function to load the documents:

```python
def load_documents():
    documents = []
    with open("text_documents.txt", "r") as f:
        for line in f:
            documents.append(line.strip())

    return documents
```

Next, let’s write the function to build the inverted index and saved the index into a file `index`:

```python
def build_inverted_index():
    inverted_index = defaultdict(list)

    for doc_id, doc in enumerate(documents):
        processed_doc = preprocess(doc)
        words = processed_doc.split()

        for word in words:
            inverted_index[word].append(doc_id)

    # Save the inverted index to a file named 'index'
    with open('index', 'wb') as file:
        pickle.dump(inverted_index, file)
```

### Search engine & results

Here, we combine all the components into one function:

```python
def load_inverted_index():
    with open('index', 'rb') as file:
        inverted_index = pickle.load(file)
    return inverted_index

def search(query):
    documents = load_documents()
    inverted_index = load_inverted_index()
    total_docs = len(documents)
    query_words = preprocess(query).split()
    scores = defaultdict(float)

    for word in query_words:
        idf = calculate_idf(word, inverted_index, total_docs)

        for doc_id in inverted_index[word]:
            tf_doc = documents[doc_id].count(word) / len(documents[doc_id])
            tf_idf_score = calculate_tf_idf(tf_doc, idf)
            scores[doc_id] += tf_idf_score

    ranked_docs = sorted(scores.items(), key=lambda x: x[1], reverse=True)

    result = [(documents[doc_id], score) for doc_id, score in ranked_docs]

    return result
```

The first function above is the `load_inverted_index()` which loads the inverted index data stored in the `index` file by `pickle`.

In the `search` function, the documents and inverted index are loaded from their respective locations. The query word supplied is preprocessed and a new dictionary `scores` is created to hold the scores of the terms contained in the query.

In the `for` loop, each word in the query gets its IDF calculated first. A child loop is included where the term frequency, inverse document frequency and the tf-idf score is computed and stored for each document contained in the reverse index.

- A reverse index is a comprehensive table that includes every word present in the corpus. For each word, it contains a record of the documents in which the word is found.

Once the calculations are complete, the documents are ranked in descending based on the relevance score computed in the child for loop, and the results returned.

An example usage for a query “politics” returned:

```python
[('Because many remain politics tonight none politics inside.', 0.3046288244472518),
 ('Billion cultural they politics that.', 0.12269772095792086)]
```

You can play with the search engine on this [Replit](https://replit.com/@Youngestdev/Search-Engine).

## Conclusion

This is a simple exposé on how to build a simple search engine from scratch. The steps followed in this blog post covers the elementary procedures involved in building a search engine and can be modified further depending on the use case.

If you’re feeling adventurous, attach this search engine to a framework and build a functional UI for it. As a bonus, improve the schema to make it work like the Google search engine - link, summary, etc.

## Notes

- There are a number of libraries for building search engine. The one I’ve worked with is [whoosh](https://whoosh.readthedocs.io/en/latest/quickstart.html). Whoosh makes indexing a seamless task ( it supports indexing directly to the RAM!).
- The functions in this blog post can be cleaned and optimized further.
- Some sections were further generated from GPT and the reverse index was paraphrased from whoosh’s [glossary](https://whoosh.readthedocs.io/en/latest/glossary.html).
- There are more components and technicalities involved in building a more robust search engine.