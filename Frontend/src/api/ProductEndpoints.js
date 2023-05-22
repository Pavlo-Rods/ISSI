import { get } from './helpers/ApiRequestsHelper'

function getProductCategories () {
  return get('productCategories')
}
function getPopularOnes () {
  return get('products/popular')
}

export { getProductCategories, getPopularOnes }
