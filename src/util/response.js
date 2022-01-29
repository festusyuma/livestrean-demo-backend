const {handleError} = require("../service");

const build = ({ status, success = false, message, data = null }) => {
    return { status: status ? status : 500, success, message, data }
}

const success = (data) => {
    return build({
        status: 200, success: true, message: 'Successful', data
    })
}

const failed = (message, data) => {
    return build({
        status: 200, message, data
    })
}

const badRequest = (message) => {
    return build({
        status: 400, message
    })
}

const unauthorized = (message) => {
    return build({
        status: 401, message
    })
}

const forbidden = (message = 'You do not have permission') => {
      return build({
          status: 403, message
      })
}

const serverError = (e = null) => {
    handleError(e)
    return build({
        status: 500,
        message: 'An internal server error occurred'
    })
}

const response = { success, failed, badRequest, unauthorized, forbidden, serverError }
module.exports = response
