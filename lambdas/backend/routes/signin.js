'use strict'

const customersController = require('dev-portal-common/customers-controller')
const {
  promisify2
} = require('dev-portal-common/promisify2')
const util = require('../util')
// this returns the key we use in the CustomersTable. It's constructed from the issuer field and the username when we
// allow multiple identity providers, this will allow google's example@example.com to be distinguishable from
// Cognito's or Facebook's example@example.com
// function getCognitoKey (req) {
//   return req.apiGateway.event.requestContext.authorizer.claims.iss + ' ' + getCognitoUsername(req)
// }

exports.post = async (req, res) => {
  const cognitoIdentityId = util.getCognitoIdentityId(req)
  const cognitoUserId = util.getCognitoUserId(req)
  console.log(`POST /signin for identity ID [${cognitoIdentityId}]`)
  try {
    // We want to uphold the invariant that "if the logged-in account has a
    // CustomersTable item, then its Id, UserPoolId, and ApiKeyId attributes
    // are set correctly".
    //
    // The ApiKeyId attribute of the CustomersTable item must already exist if
    // the item itself exists; if not, it will be updated later by
    // `ensureApiKeyForCustomer`. So we can safely pass a dummy here while
    // upholding the invariant.

    await promisify2(customersController.ensureCustomerItem)(
      cognitoIdentityId,
      cognitoUserId,
      'NO_API_KEY'
    )
    //EOD HERE -THIS WAS ADDED BY US - is this code being called???? how was Armando getting it called???
    const email = await customersController.getEmailForUserSub(cognitoUserId)
    await customersController.ensureApiKeyForCustomer({
      userId: email, //EOD note : this was changed by Armando...
      identityId: cognitoIdentityId
    })

  } catch (error) {
    console.log(`error: ${error}`)
    res.status(500).json(error)
    return
  }
};



// try {
//   // We want to uphold the invariant that "if the logged-in account has a
//   // CustomersTable item, then its Id, UserPoolId, and ApiKeyId attributes
//   // are set correctly".
//   //
//   // The ApiKeyId attribute of the CustomersTable item must already exist if
//   // the item itself exists; if not, it will be updated later by
//   // `ensureApiKeyForCustomer`. So we can safely pass a dummy here while
//   // upholding the invariant.

//   await promisify2(customersController.ensureCustomerItem)(
//     cognitoIdentityId,
//     cognitoUserId,
//     'NO_API_KEY'
//   )
//   //EOD HERE -THIS WAS ADDED BY US - is this code being called???? how was Armando getting it called???
//   const email = await customersController.getEmailForUserSub(cognitoUserId)

//   try {
//     /*
//           await Promise.all([
//             customersController.saveOpenPreLoginAccount({ cognitoUserId, email }),
//             customersController.addAccountToRegisteredGroup({
//               username,
//               userPoolId,
//               registeredGroupName
//             })
//           ])
//         } catch (error) {
//             //ignoring this error in the case where the user may be already
//             //registered
//             console.log(`error: ${error}`)
//             res.status(200).json({})
//             return
//         }*/

//     //EOD HERE NOW
//     //IT VERY WELL MAY BE FAILING BEFORE GETTING TO THE NEXT LINE HERE B/C OF POLICY ....


//     await customersController.ensureApiKeyForCustomer({
//       userId: email, //EOD note : this was changed by Armando...
//       identityId: cognitoIdentityId
//     })
//   } catch (error) {
//     console.log(`error: ${error}`)
//     res.status(500).json(error)
//     return
//   }

//   res.status(200).json({})
// }

// }