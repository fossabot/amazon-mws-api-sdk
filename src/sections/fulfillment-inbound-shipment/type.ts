import { Parameters, ParameterTypes } from '../../http'
import { RequireOnlyOne } from '../types'

export const canonicalizeInboundShipmentPlanRequestItems = (
  requestItem: InboundShipmentPlanRequestItem,
) => {
  return {
    SellerSKU: requestItem.SellerSKU,
    ASIN: requestItem.ASIN,
    Condition: requestItem.Condition,
    Quantity: requestItem.Quantity,
    QuantityInCase: requestItem.QuantityInCase,
    'PrepDetailsList.PrepDetails': requestItem.PrepDetailsList,
  }
}

export const canonicalizeParametersCreateInboUpdateundShipmentPlan = (
  parameters: CreateInboundShipmentPlanParameters,
) => {
  const fixedInboundShipmentPlanRequestItems = parameters.InboundShipmentPlanRequestItems.map(
    (requestItem) => canonicalizeInboundShipmentPlanRequestItems(requestItem),
  )
  return {
    ShipToCountryCode: parameters.ShipToCountryCode,
    ShipFromAddress: parameters.ShipFromAddress,
    ShipToCountrySubdivisionCode: parameters.ShipToCountrySubdivisionCode,
    LabelPrepPreference: parameters.LabelPrepPreference,
    'InboundShipmentPlanRequestItems.member': fixedInboundShipmentPlanRequestItems,
  }
}

const canonicalizeDate = (date: Date | undefined): string | undefined => {
  if (date) {
    // convert releaseDate to YYYY-MM-DD
    const offset = date.getTimezoneOffset()
    const releaseDate = new Date(date.getTime() + offset * 60 * 1000)
    return releaseDate.toISOString().split('T')[0]
  }
  return undefined
}

export const canonicalizeInboundShipmentItem = (item: InboundShipmentItem) => {
  const releaseDateString = canonicalizeDate(item.ReleaseDate)

  return {
    ShipmentId: item.ShipmentId,
    SellerSKU: item.SellerSKU,
    FulfillmentNetworkSKU: item.FulfillmentNetworkSKU,
    QuantityShipped: item.QuantityShipped,
    QuantityReceived: item.QuantityReceived,
    QuantityInCase: item.QuantityInCase,
    /**
     * Note: // C# library has this field as 'PrepDetailsList.PrepDetails'
     * but documentation says it's 'PrepDetailsList.member'.
     * Following C# because docs is unreliable
     */
    'PrepDetailsList.PrepDetails': item.PrepDetailsList,
    ReleaseDate: releaseDateString,
  }
}

export const canonicalizeParametersCreateUpdateInboundShipment = (
  parameters: CreateInboundShipmentParameters,
) => {
  const shipmentItemsCanonicalized = parameters.InboundShipmentItems.map((item) =>
    canonicalizeInboundShipmentItem(item),
  )
  return {
    ShipmentId: parameters.ShipmentId,
    InboundShipmentHeader: parameters.InboundShipmentHeader,
    'InboundShipmentItems.member': shipmentItemsCanonicalized,
  }
}

export interface GetInboundGuidanceForSKUParameters {
  SellerSKUList: string[]
  MarketplaceId: string
}

export interface GetInboundGuidanceForASINParameters {
  ASINList: string[]
  MarketplaceId: string
}

export interface AddressFIS {
  Name: string
  AddressLine1: string
  AddressLine2?: string
  City: string
  DistrictOrCounty?: string
  StateOrProvinceCode?: string
  CountryCode: string
  PostalCode?: string
  [key: string]: string | undefined
}

export type LabelPrepPreference = 'SELLER_LABEL' | 'AMAZON_LABEL_ONLY' | 'AMAZON_LABEL_PREFERRED'
export type ConditionFIS =
  | 'NewItem'
  | 'NewWithWarranty'
  | 'NewOEM'
  | 'NewOpenBox'
  | 'UsedLikeNew'
  | 'UsedVeryGood'
  | 'UsedGood'
  | 'UsedAcceptable'
  | 'UsedPoor'
  | 'UsedRefurbished'
  | 'CollectibleLikeNew'
  | 'CollectibleVeryGood'
  | 'CollectibleGood'
  | 'CollectibleAcceptable'
  | 'CollectiblePoor'
  | 'RefurbishedWithWarranty'
  | 'Refurbished'
  | 'Club'

export enum PrepInstructionEnum {
  Polybagging = 'Polybagging',
  BubbleWrapping = 'BubbleWrapping',
  Taping = 'Taping',
  BlackShrinkWrapping = 'BlackShrinkWrapping',
  Labeling = 'Labeling',
  HangGarment = 'HangGarment',
}

export type PrepInstruction = keyof typeof PrepInstructionEnum

export enum PrepOwnerEnum {
  AMAZON = 'AMAZON',
  SELLER = 'SELLER',
}

export type PrepOwner = keyof typeof PrepOwnerEnum

export interface PrepDetails {
  PrepInstruction: PrepInstruction
  PrepOwner: PrepOwner
}

export interface InboundShipmentPlanRequestItem {
  SellerSKU: string
  ASIN?: string
  Condition?: ConditionFIS
  Quantity: number
  QuantityInCase?: number
  PrepDetailsList?: PrepDetails[]
}

export interface CreateInboundShipmentPlanParameters {
  ShipFromAddress: AddressFIS
  ShipToCountryCode?: string
  ShipToCountrySubdivisionCode?: string
  LabelPrepPreference?: LabelPrepPreference
  InboundShipmentPlanRequestItems: InboundShipmentPlanRequestItem[]
}

export type ShipmentStatus = 'WORKING' | 'SHIPPED' | 'CANCELLED'

export type IntendedBoxContentsSource = 'NONE' | 'FEED' | '2D_BARCODE'

export interface InboundShipmentHeader {
  ShipmentName: string
  ShipFromAddress: AddressFIS
  DestinationFulfillmentCenterId: string
  LabelPrepPreference: LabelPrepPreference
  AreCasesRequired?: boolean
  ShipmentStatus: ShipmentStatus
  IntendedBoxContentsSource?: IntendedBoxContentsSource
  [key: string]: string | undefined | boolean | AddressFIS
}

export interface InboundShipmentItem {
  ShipmentId?: string
  SellerSKU: string
  FulfillmentNetworkSKU?: string
  QuantityShipped: number
  QuantityReceived?: number
  QuantityInCase?: number
  PrepDetailsList?: PrepDetails[]
  ReleaseDate?: Date // convert to YYYY-MM-DD format
}

export interface CreateInboundShipmentParameters {
  ShipmentId: string
  InboundShipmentHeader: InboundShipmentHeader
  InboundShipmentItems: InboundShipmentItem[]
}

export interface GetPreorderInfoParameters {
  ShipmentId: string
}

export interface ConfirmPreorderParameters {
  ShipmentId: string
  NeedByDate: Date
}

export interface GetPrepInstructionsForSKUParameters {
  SellerSKUList: string[]
  ShipToCountryCode: string
}

export interface GetPrepInstructionsForASINParameters {
  ASINList: string[]
  ShipToCountryCode: string
}

interface Amount {
  CurrencyCode: string
  Value: string
}
interface PartneredEstimate {
  Amount?: Amount
  ConfirmDeadline?: Date
  VoidDeadline?: Date
}

type DimensionsUnit = 'inches' | 'centimeters'

interface FIBDimensions {
  Unit: DimensionsUnit
  Length: number
  Width: number
  Height: number
}

type WeightUnit = 'pounds' | 'kilograms'

interface FIBWeight {
  Unit: WeightUnit
  Value: number
}

type PackageStatus = 'SHIPPED' | 'IN_TRANSIT' | 'DELIVERED' | 'CHECKED_IN' | 'RECEIVING' | 'CLOSED'

export interface PartneredSmallParcelPackageInput {
  Dimensions: FIBDimensions
  Weight: FIBWeight
}

interface PartneredSmallParcelDataInput {
  CarrierName: string
  PackageList: PartneredSmallParcelPackageInput[]
}

interface NonPartneredSmallParcelPackageOutput {
  TrackingId: string
}

interface NonPartneredSmallParcelDataInput {
  CarrierName: string
  PackageList: NonPartneredSmallParcelPackageOutput[]
}

interface Contact {
  Name: string
  Phone: string
  Email: string
  Fax: string
}

interface Pallet {
  Dimension: FIBDimensions
  Weight?: FIBWeight
  IsStacked: boolean
}

interface PartneredLtlDataInput {
  Contact: Contact
  BoxCount: number
  SellerFreightClass?: string
  FreightReadyDate: Date // YYYY-MM-DD
  PalletList?: Pallet[]
  TotalWeight?: FIBWeight
  SellerDeclaredValue?: Amount
}

interface NonPartneredLtlDataInput {
  CarrierName: string
  ProNumber: string
}

export interface PutTransportContentParameters {
  ShipmentId: string
  IsPartnered: boolean
  ShipmentType: string
  TransportDetails: RequireOnlyOne<
    {
      PartneredSmallParcelData?: PartneredSmallParcelDataInput
      NonPartneredSmallParcelData?: NonPartneredSmallParcelDataInput
      PartneredLtlData?: PartneredLtlDataInput
      NonPartneredLtlData?: NonPartneredLtlDataInput
    },
    | 'PartneredSmallParcelData'
    | 'NonPartneredSmallParcelData'
    | 'PartneredLtlData'
    | 'NonPartneredLtlData'
  >
}

export const canonicalizePutTransportContentParameters = (
  parameters: PutTransportContentParameters,
): Parameters => {
  const { TransportDetails } = parameters
  const {
    PartneredSmallParcelData,
    NonPartneredSmallParcelData,
    PartneredLtlData,
    NonPartneredLtlData,
  } = TransportDetails
  const transportDetails: ParameterTypes = {
    PartneredSmallParcelData: PartneredSmallParcelData
      ? {
          'PackageList.member': PartneredSmallParcelData?.PackageList,
          CarrierName: PartneredSmallParcelData?.CarrierName,
        }
      : undefined,
    NonPartneredSmallParcelData: NonPartneredSmallParcelData
      ? {
          CarrierName: NonPartneredSmallParcelData.CarrierName,
          'PackageList.member': NonPartneredSmallParcelData.PackageList,
        }
      : undefined,
    PartneredLtlData: PartneredLtlData
      ? {
          Contact: PartneredLtlData.Contact,
          BoxCount: PartneredLtlData.BoxCount,
          SellerFreightClass: PartneredLtlData.SellerFreightClass,
          FreightReadyDate: canonicalizeDate(PartneredLtlData.FreightReadyDate),
          'PalletList.member': PartneredLtlData.PalletList,
          TotalWeight: PartneredLtlData.TotalWeight,
          SellerDeclaredValue: PartneredLtlData.SellerDeclaredValue,
        }
      : undefined,
    NonPartneredLtlData: NonPartneredLtlData
      ? {
          CarrierName: NonPartneredLtlData.CarrierName,
          ProNumber: NonPartneredLtlData.ProNumber,
        }
      : undefined,
  } as { [key: string]: undefined | Record<string, ParameterTypes> }
  return {
    ShipmentId: parameters.ShipmentId,
    IsPartnered: parameters.IsPartnered,
    ShipmentType: parameters.ShipmentType,
    TransportDetails: transportDetails,
  }
}

export interface EstimateTransportRequestParameters {
  ShipmentId: string
}
