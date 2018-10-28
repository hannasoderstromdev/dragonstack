const pool = require('../../databasePool')
const DragonTraitTable = require('../dragonTrait/table')

class DragonTable {
  static storeDragon(dragon) {
    const { birthdate, nickname, generationId } = dragon

    return new Promise((resolve, reject) => {
      pool.query(
        `
          INSERT INTO dragon(birthdate, nickname, "generationId")
          values($1, $2, $3) RETURNING id
        `,
        [birthdate, nickname, generationId],
        (error, response) => {
          if (error) return reject(error)

          const dragonId = response.rows[0].id

          // Await all promises to succeed
          Promise.all(
            dragon.traits.map(({ traitType, traitValue }) => {
              return DragonTraitTable.storeDragonTrait({
                dragonId,
                traitType,
                traitValue,
              })
            })
          )
            .then(() => resolve({ dragonId }))
            .catch(error => reject(error))
        }
      )
    })
  }

  static getDragon({ dragonId }) {
    return new Promise((resolve, reject) => {
      pool.query(
        `SELECT birthdate, nickname, "generationId" 
         FROM dragon 
         WHERE dragon.id = $1`,
        [dragonId],
        (error, response) => {
          if (error) return reject(error)
          if (response.rows.length === 0)
            return reject(new Error('No dragon found'))

          resolve(response.rows[0])
        }
      )
    })
  }
}

// Comment out to test
// DragonTable.getDragon({ dragonId: 1 })
//   .then(dragon => console.log(dragon))
//   .catch(error => console.error(error))

module.exports = DragonTable
