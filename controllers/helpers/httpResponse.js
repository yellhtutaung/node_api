const responseSuccess = (status=200,message='Response success',data=null) =>
{
    return {status: status,message: message,data: data,}
}
const responseError = (status=500,message='Response Error !',data=null) =>
{
    return {status: status,message: message,data: data,}
}

module.exports = { responseSuccess,responseError }