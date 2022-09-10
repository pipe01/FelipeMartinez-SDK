# SDK design

The SDK has been designed with a [fluent](https://en.wikipedia.org/wiki/Fluent_interface) interface in mind, which I find to be the most comfortable to use with APIs that are more complex than a simple CRUD.

It is class-based, meaning that all of the root public methods return a class that represents an API call. These classes contain methods that modify the class itself and return a variant of the class that does not contain the called method, since it doesn't make sense to set these parameters more than once.

The SDK exports one method, `createApi`, which returns an object containing two methods per "root level object", that is: books, movies, characters, quotes and characters. Books, movies and characters contain child methods that request information related to a single item, for example a character's quotes.

All request chains can be terminated with a `get` call, which will fetch the necessary resources from the API. Additionally, endpoints that return multiple values can be terminated through a `getAll` call, which will iterate over pages and return the complete set of items, not just a single page.