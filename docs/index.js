import swagger from './swagger.json';
import baseResponse from './baseResponse.json';

swagger.paths['/api/v1'] = baseResponse;

module.exports = swagger;
