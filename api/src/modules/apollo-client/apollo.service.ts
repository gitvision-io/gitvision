import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core';
import fetch from 'cross-fetch';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ApolloService {
  constructor(private token: string) {}

  githubClient() {
    return new ApolloClient({
      link: new HttpLink({
        uri: 'https://api.github.com/graphql',
        headers: {
          authorization: `token ${this.token}`,
        },
        fetch,
      }),
      cache: new InMemoryCache(),
    });
  }
}
