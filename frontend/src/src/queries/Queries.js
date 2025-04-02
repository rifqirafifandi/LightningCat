import { gql } from '@apollo/client';

const GET_RECORDS_AVG_PRICE = gql`
  query GetRecordsAvgPrice (
      $latRangeGte: Float, 
      $latRangeLte: Float, 
      $lonRangeGte: Float, 
      $lonRangeLte: Float, 
      $yearRangeGte: Int,
      $town: [String],
      $flatType: [String],
      $minSqf: Float,
      $maxSqf: Float,
      $minPsf: Float,
      $maxPsf: Float,
  ) {
    getRecordsAveragePrice(args: {
      latRange: {gte: $latRangeGte, lte: $latRangeLte},
      lonRange: {gte: $lonRangeGte, lte: $lonRangeLte},
      yearRange: {gte: $yearRangeGte},
      towns: $town,
      flatTypes: $flatType,
      sqfRange: {gte: $minSqf, lte: $maxSqf},
      psfRange: {gte: $minPsf, lte: $maxPsf}
    }) {
      _id
      Psf 
      }}`;


const GET_RECORDS = gql`
  query GetRecordsByBounds(
      $latRangeGte: Float, 
      $latRangeLte: Float, 
      $lonRangeGte: Float, 
      $lonRangeLte: Float, 
      $town: [String],
      $flatType: [String],
      $yearRangeGte: Int,
      $minSqf: Float,
      $maxSqf: Float,
      $minPsf: Float,
      $maxPsf: Float,
) {
    getRecords(args: {
      towns: $town,
      flatTypes: $flatType,
      latRange: { gte: $latRangeGte, lte: $latRangeLte },
      lonRange: { gte: $lonRangeGte, lte: $lonRangeLte },
      limit: 300,
      yearRange: { gte: $yearRangeGte },
      sqfRange : { gte: $minSqf, lte: $maxSqf },
      psfRange: { gte: $minPsf, lte: $maxPsf }
    }) {
      address
      town
      resale_price
      flat_type
      Psf
      Sqft
      floor_area_sqm
      year
      lat
      lng
    }}`;


const GET_LISTINGS = gql`
query GetListingsByBounds(
    $latRangeGte: Float, 
    $latRangeLte: Float, 
    $lonRangeGte: Float, 
    $lonRangeLte: Float, 
    $town: [String],
    $flatType: [String],
    $minSqf: Float,
    $maxSqf: Float,
    $minPsf: Float,
    $maxPsf: Float,
  ) {
  getListings(args: {
    towns: $town,
    flatTypes: $flatType,
    latRange: { gte: $latRangeGte, lte: $latRangeLte },
    lonRange: { gte: $lonRangeGte, lte: $lonRangeLte },
    limit: 80,
    sqfRange : { gte: $minSqf, lte: $maxSqf },
    psfRange: { gte: $minPsf, lte: $maxPsf }
  }) {
    Address
    Price
    HDBType
    town
    Sqft
    Psf
    URL
    lat: Lat
    lng: Lon
  }
}
`;

const GET_DISTINCT_TOWNS = gql`
query {
    getDistinctTowns
}
`;

const GET_DISTINCT_FLAT_TYPES = gql`
query {
    getDistinctFlatTypes
}
`;

export default {
    GET_RECORDS_AVG_PRICE, 
    GET_RECORDS,
    GET_LISTINGS,
    GET_DISTINCT_TOWNS,
    GET_DISTINCT_FLAT_TYPES
};
