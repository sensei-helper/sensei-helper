import {Instance, SnapshotIn, SnapshotOut, types} from 'mobx-state-tree';
import {InventoryForm} from 'components/calculationInput/equipments/inventory/InventoryUpdateDialog';

let equipmentsRequirementStore: IEquipmentsRequirementStore | undefined;

const byPiece = types
    .model(
        {
          pieceId: types.string,
          count: types.number,
        }
    );

const byEquipment = types
    .model(
        {
          currentEquipmentId: types.string,
          targetEquipmentId: types.string,
          count: types.number,
          nickname: types.optional(types.string, ''),
        }
    );

const pieceInventory = types
    .model(
        {
          pieceId: types.identifier,
          inStockCount: types.number,
        }
    );

export enum RequirementMode {
  ByPiece = 'ByPiece',
  ByEquipment = 'ByEquipment',
}

export const EquipmentsRequirementStore = types
    .model({
      requirementByPieces: types.array(byPiece),
      requirementByEquipments: types.array(byEquipment),
      piecesInventory: types.map(pieceInventory),
      requirementMode: types.optional(types.enumeration<RequirementMode>('RequirementMode', Object.values(RequirementMode)), RequirementMode.ByEquipment),
    })
    .actions((self) => {
      const addPiecesRequirement = (requirement : IRequirementByPiece) => {
        self.requirementByPieces.push(requirement);
      };

      const updatePiecesRequirement = (pieceInfoToEdit : PieceInfoToEdit) => {
        const requirement = self.requirementByPieces[pieceInfoToEdit.indexInStoreArray];
        if (!requirement) return;
        self.requirementByPieces[pieceInfoToEdit.indexInStoreArray] = {
          pieceId: pieceInfoToEdit.pieceId,
          count: pieceInfoToEdit.count,
        };
      };

      const deletePiecesRequirement = (pieceInfoToEdit : PieceInfoToEdit) => {
        const requirement = self.requirementByPieces[pieceInfoToEdit.indexInStoreArray];
        if (!requirement) return;

        self.requirementByPieces.splice(pieceInfoToEdit.indexInStoreArray, 1);
      };


      const sortEquipmentStoreByNickName = () => {
        self.requirementByEquipments.sort(
            (a, b) => {
              return a.nickname < b.nickname ? 1:-1;
            }
        );
      };

      const addEquipmentsRequirement = (requirement : IRequirementByEquipment) => {
        self.requirementByEquipments.push(requirement);
        if (requirement.nickname) {
          sortEquipmentStoreByNickName();
        }
      };

      const updateEquipmentsRequirement = (equipInfoToEdit : EquipmentInfoToEdit) => {
        const requirement = self.requirementByEquipments[equipInfoToEdit.indexInStoreArray];
        if (!requirement) return;
        self.requirementByEquipments[equipInfoToEdit.indexInStoreArray] = {
          currentEquipmentId: equipInfoToEdit.currentEquipmentId,
          targetEquipmentId: equipInfoToEdit.targetEquipmentId,
          count: equipInfoToEdit.count,
          nickname: equipInfoToEdit.nickname,
        };
        if (requirement.nickname) {
          sortEquipmentStoreByNickName();
        }
      };

      const deleteEquipmentsRequirement = (equipInfoToEdit : EquipmentInfoToEdit) => {
        const requirement = self.requirementByEquipments[equipInfoToEdit.indexInStoreArray];
        if (!requirement) return;

        self.requirementByEquipments.splice(equipInfoToEdit.indexInStoreArray, 1);
      };

      const getAllRequiredPieceIds = () => {
        return self.requirementByPieces.reduce<Set<string>>(
            (set, curr) => {
              return set.add(curr.pieceId);
            }, new Set()
        );
      };

      const updateRequirementMode = (requirementMode: RequirementMode) => {
        if (!requirementMode) return;
        self.requirementMode = requirementMode;
      };

      const updateInventory = (inventoryForm: InventoryForm) => {
        for (const [pieceId, inStockCountStr] of Object.entries(inventoryForm)) {
          const inventoryToUpdate = self.piecesInventory.get(pieceId);
          self.piecesInventory.put( {
            pieceId,
            inStockCount: parseInt(inStockCountStr) ?? 0,
          });
        }
      };

      return {addPiecesRequirement, updatePiecesRequirement, deletePiecesRequirement,
        addEquipmentsRequirement, updateEquipmentsRequirement, deleteEquipmentsRequirement,
        getAllRequiredPieceIds, updateRequirementMode, updateInventory,
      };
    });

export type IEquipmentsRequirementStore = Instance<typeof EquipmentsRequirementStore>
export type IRequirementByPiece = Instance<typeof byPiece>
export type IPieceInventory = Instance<typeof pieceInventory>
export type IRequirementByEquipment = Instance<typeof byEquipment>
export type PieceInfoToEdit = IRequirementByPiece & {
    indexInStoreArray : number
};
export type EquipmentInfoToEdit = IRequirementByEquipment & {
  indexInStoreArray : number
};

export type IStoreSnapshotIn = SnapshotIn<typeof EquipmentsRequirementStore>
export type IStoreSnapshotOut = SnapshotOut<typeof EquipmentsRequirementStore>
