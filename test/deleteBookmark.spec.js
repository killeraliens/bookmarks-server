const app = require('../src/app')

describe.skip('DELETE /bookmarks/:id endpoint', () => {
 it('returns 204 upon successful delete', () => {
   return supertest(app)
     .delete('/bookmarks/2')
     .set(authHeader)
     .expect(204)
 })

 it('returns 404 if id not found', () => {
   return supertest(app)
     .delete('/bookmarks/666')
     .set(authHeader)
     .expect(404)
 })

})
