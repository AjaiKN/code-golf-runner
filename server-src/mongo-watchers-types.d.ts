import 'fastify'
import { ChangeStream } from 'mongodb'

declare module 'fastify' {
  interface FastifyInstance {
    /** MongoDB watchers. Subscribe to these to watch for changes to the database. */
    mongoWatchers: Record<string, ChangeStream<any>>
  }
}
