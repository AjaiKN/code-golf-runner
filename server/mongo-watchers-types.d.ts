import 'fastify'
import { ChangeStream } from 'mongodb'

declare module 'fastify' {
  interface FastifyInstance {
    mongoWatchers: Record<string, ChangeStream<any>>
  }
}
