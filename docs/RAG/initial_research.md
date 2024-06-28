# Using knowledge graph for RAG
- There are 2 types of data, structured and unstructured. The following documentation will cover how both types of data can be retrieved using cypher queries (for structured data) and vectory similarity metrics (for unstructured data).

- Detailed information can be found here: https://neo4j.com/developer-blog/knowledge-graph-rag-application/

- These docs will provide a high-level overview.


# Overview
1. Data is stored in a graph database
    - This graph database containes nodes and edges, where edges define relationships between notes. 
    - For example, if we want to create a DevOPs system, a person might be a node, a ticket might be another node, and an edge map point from the person to the ticket with the label "assigned".
2. Embeddings are generated for every node. These will eventually come in use when determining similarity.
3. When user enters a prompt, its embedding is generated.
4. The prompt's embeddings are compared to every node's embeddings to get top `X` closest prompts.
5. Those top `X` prompts are utilized as the context.

## Problem
- Vectory similarity search is good for unstructured data, but not so much for structured data.
- For example: if the user's prompt was `How many open tickets are there?`
- Using vector similarity may return `X` closest nodes, all of which are open tickets.
- As a result, those `X` nodes get passed as context, and the model will return `X`.
- However, there may have been more than `X` open tickets, but the model never knows that because only `X` get passed as context.

## Solution
- This is where `Neo4j` and `cypher` come into play. 
- `cypher` is a query language that can be used to retrieve information from a graph database.
- Given user's prompt, a cypher query is generated, and the graph db is queried for the answer (instead of using vector similarity).
1. User enters a prompt, such as `How many open tickets are there?`
2. A cypher query is generated, such as `MATCH (t:Task {status:'Open'}) RETURN count(*)"`
3. The result of the cypher query is returned

## Structured v Unstructured
- How do we balance between the 2 approaches?
- Since we knoww that vectory similarity is good for unstructured data and cypher can be used to query structured graph data, we can employ an agent that decides which to choose.
1. User enters a prompt.
2. The agent determines whether vectory similarity or cypher query should be used.
3. The chosen method is employed, and the answer is returned to the user.


### Personal Notes
- The use of graph db seems highly effective in the case that the underlying dataset containes relationships.
- However, if that is not the case, then it may not make sense to use Neo4j and might make more sense to simply use vector similarity.
- We would have to discuss the type of underlying data that is used for various courses.
    - For example, History is a course where much of the content contains relationships
        - Such as `(George Washington) -[first president]-> (United States)`
    - Other courses may not have such relationships.


# Implementation
- I think the compute should be abstracted away to the cloud.
    - A user enters a prompt
    - That prompt is sent to a server on the cloud
    - The server handles the logic (the whole RAG system)
    - The server returns the LLM response to the client
    - Client displays the response to the user