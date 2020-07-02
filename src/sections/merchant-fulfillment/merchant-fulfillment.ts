import { ParsingError } from '../../error'
import { HttpClient, RequestMeta, Resource } from '../../http'
import { getServiceStatusByResource } from '../shared'
import {
  CreateShipment,
  CreateShipmentResponse,
  GetAdditionalSellerInputs,
  GetAdditionalSellerInputsResponse,
  GetEligibleShippingServices,
  GetEligibleShippingServicesResponse,
} from './codec'
import {
  canonicalizeCreateShipmentParameters,
  canonicalizeParametersGetEligibleShippingServiceParameters,
  CreateShipmentParameters,
  GetAdditionalSellerInputsParameters,
  GetEligibleShippingServicesParameters,
} from './type'

const MERCHANT_FULFILLMENT_API_VERSION = '2015-06-01'

export class MerchantFulfillment {
  constructor(private httpClient: HttpClient) {}

  async createShipment(
    parameters: CreateShipmentParameters,
  ): Promise<[CreateShipment, RequestMeta]> {
    const [response, meta] = await this.httpClient.request('POST', {
      resource: Resource.MerchantFulfillment,
      version: MERCHANT_FULFILLMENT_API_VERSION,
      action: 'CreateShipment',
      parameters: canonicalizeCreateShipmentParameters(parameters),
    })

    return CreateShipmentResponse.decode(response).caseOf({
      Right: (x) => [x.CreateShipmentResponse.CreateShipmentResult, meta],
      Left: (error) => {
        throw new ParsingError(error)
      },
    })
  }

  async getAddtionalSellerInputs(
    parameters: GetAdditionalSellerInputsParameters,
  ): Promise<[GetAdditionalSellerInputs, RequestMeta]> {
    const [response, meta] = await this.httpClient.request('POST', {
      resource: Resource.MerchantFulfillment,
      version: MERCHANT_FULFILLMENT_API_VERSION,
      action: 'GetAdditionalSellerInputs',
      parameters,
    })

    return GetAdditionalSellerInputsResponse.decode(response).caseOf({
      Right: (x) => [x.GetAdditionalSellerInputsResponse.GetAdditionalSellerInputsResult, meta],
      Left: (error) => {
        throw new ParsingError(error)
      },
    })
  }

  async getEligibleShippingServices(
    parameters: GetEligibleShippingServicesParameters,
  ): Promise<[GetEligibleShippingServices, RequestMeta]> {
    const [response, meta] = await this.httpClient.request('POST', {
      resource: Resource.MerchantFulfillment,
      version: MERCHANT_FULFILLMENT_API_VERSION,
      action: 'GetEligibleShippingServices',
      parameters: canonicalizeParametersGetEligibleShippingServiceParameters(parameters),
    })

    return GetEligibleShippingServicesResponse.decode(response).caseOf({
      Right: (x) => [x.GetEligibleShippingServicesResponse.GetEligibleShippingServicesResult, meta],
      Left: (error) => {
        throw new ParsingError(error)
      },
    })
  }

  async getServiceStatus() {
    return getServiceStatusByResource(
      this.httpClient,
      Resource.MerchantFulfillment,
      MERCHANT_FULFILLMENT_API_VERSION,
    )
  }
}
