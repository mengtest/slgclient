import { ArmyCmd } from "../general/ArmyProxy";
import DateUtil from "../utils/DateUtil";
import { MapBuildData } from "./MapBuildProxy";
import { MapCityData } from "./MapCityProxy";
import MapCommand from "./MapCommand";
import { MapResConfig, MapResData, MapResType } from "./MapProxy";
import MapUICommand from "./ui/MapUICommand";


const { ccclass, property } = cc._decorator;

@ccclass
export default class MapClickUILogic extends cc.Component {
    @property(cc.Node)
    bgSelect: cc.Node = null;
    @property(cc.Label)
    labelName: cc.Label = null;
    @property(cc.Label)
    labelUnion: cc.Label = null;
    @property(cc.Label)
    labelLunxian: cc.Label = null;
    @property(cc.Label)
    labelPos: cc.Label = null;
    @property(cc.Label)
    labelMian: cc.Label = null;
    @property(cc.Node)
    bgMain: cc.Node = null;

    @property(cc.Node)
    durableNode: cc.Node = null;
    @property(cc.Label)
    labelDurable: cc.Label = null;
    @property(cc.ProgressBar)
    progressBarDurable: cc.ProgressBar = null;
    @property(cc.Node)
    leftInfoNode: cc.Node = null;
    @property(cc.Label)
    labelYield: cc.Label = null;
    @property(cc.Label)
    labelSoldierCnt: cc.Label = null;
    @property(cc.Button)
    btnMove: cc.Button = null;
    @property(cc.Button)
    btnOccupy: cc.Button = null;
    @property(cc.Button)
    btnGiveUp: cc.Button = null;
    @property(cc.Button)
    btnReclaim: cc.Button = null;
    @property(cc.Button)
    btnEnter: cc.Button = null;
    @property(cc.Button)
    btnBuild: cc.Button = null;
    @property(cc.Button)
    btnTransfer: cc.Button = null;

    @property(cc.Button)
    btnTagAdd: cc.Button = null;
    @property(cc.Button)
    btnTagRemove: cc.Button = null;

    protected _data: any = null;
    protected _pixelPos: cc.Vec2 = null;
    protected onLoad(): void {

    }

    protected onDestroy(): void {
        this._data = null;
        this._pixelPos = null;
    }

    protected onEnable(): void {
        cc.systemEvent.on("update_build", this.onUpdateBuild, this);

        this.bgSelect.opacity = 255;
        let tween: cc.Tween = cc.tween(this.bgSelect).to(0.8, { opacity: 0 }).to(0.8, { opacity: 255 });
        tween = tween.repeatForever(tween);
        tween.start();
    }

    protected onDisable(): void {
        cc.systemEvent.targetOff(this);
        cc.Tween.stopAllByTarget(this.bgSelect);
        this.stopCountDown();
    }

    protected onUpdateBuild(data: MapBuildData): void {
        if (this._data
            && this._data instanceof MapBuildData
            && this._data.x == data.x
            && this._data.y == data.y) {
            this.setCellData(data, this._pixelPos);
        }
    }

    protected onClickEnter(): void {
        if (this._data instanceof MapBuildData){
            cc.systemEvent.emit("open_fortress_about", this._data);
        }else if (this._data instanceof MapCityData){
            cc.systemEvent.emit("open_city_about", this._data);
        }
       
        this.node.parent = null;
    }

    protected onClickReclaim(): void {
        cc.systemEvent.emit("open_army_select_ui", ArmyCmd.Reclaim, this._data.x, this._data.y);
        this.node.parent = null;
    }

    protected onClickGiveUp(): void {
        MapCommand.getInstance().giveUpBuild(this._data.x, this._data.y);
        this.node.parent = null;
    }

    protected onClickBuild(): void {
        MapCommand.getInstance().build(this._data.x, this._data.y, 50);
        this.node.parent = null;
    }

    protected onClickTransfer(): void{
        console.log("onClickTransfer");
        this.node.parent = null;
        cc.systemEvent.emit("open_army_select_ui", ArmyCmd.Transfer, this._data.x, this._data.y);
    }

    protected onClickMove(): void {
        if (MapCommand.getInstance().isCanMoveCell(this._data.x, this._data.y)) {
            cc.systemEvent.emit("open_army_select_ui", ArmyCmd.Garrison, this._data.x, this._data.y);
        } else {
            console.log("只能驻军自己占领的地");
        }
        this.node.parent = null;
    }


    protected onTagAdd(): void {
        MapCommand.getInstance().opPosTag(1, this._data.x, this._data.y, this.labelName.string);
        this.node.parent = null;
    }

    protected onTagRemove(): void {
        MapCommand.getInstance().opPosTag(0, this._data.x, this._data.y);
        this.node.parent = null;
    }

    protected onClickOccupy(): void {
        if (MapCommand.getInstance().isCanOccupyCell(this._data.x, this._data.y)) {
            cc.systemEvent.emit("open_army_select_ui", ArmyCmd.Attack, this._data.x, this._data.y);
        } else {
            console.log("只能占领自己相邻的地");
        }

        this.node.parent = null;
    }

    public setCellData(data: any, pixelPos: cc.Vec2): void {
        this._data = data;
        this._pixelPos = pixelPos;
        this.labelPos.string = "(" + data.x + ", " + data.y + ")";
        this.leftInfoNode.active = true;
        this.btnReclaim.node.active = false;
        this.btnEnter.node.active = false;
        this.bgSelect.setContentSize(200, 100);
        var isTag = MapCommand.getInstance().proxy.isPosTag(this._data.x, this._data.y);

        // console.log("isTag:", isTag);

        this.btnTagAdd.node.active = !isTag;
        this.btnTagRemove.node.active = isTag;
        
        if (this._data instanceof MapResData) {
            //点击的是野外
            this.btnMove.node.active = false;
            this.btnOccupy.node.active = true;
            this.btnGiveUp.node.active = false;
            this.btnBuild.node.active = false;
            this.btnTransfer.node.active = false;
            this.durableNode.active = false;

        } else if (this._data instanceof MapBuildData) {
            //点击的是占领地
            if ((this._data as MapBuildData).rid == MapCommand.getInstance().buildProxy.myId) {
                //我自己的地
                this.btnMove.node.active = true;
                this.btnOccupy.node.active = false;
                this.btnGiveUp.node.active = !this._data.isInGiveUp();
                this.btnReclaim.node.active = this._data.isResBuild();
                this.btnBuild.node.active = !this._data.isWarFree();
                if (this._data.isResBuild() == false && this._data.isSysCity() == false){
                    this.btnEnter.node.active = true;
                    this.btnBuild.node.active = false;
                    this.btnTransfer.node.active = !this._data.isBuilding();
                }else{
                    this.btnTransfer.node.active = false;
                }

                if (this._data.isInGiveUp()){
                    this.btnBuild.node.active = false;
                }

                if (this._data.isWarFree()){
                    this.btnGiveUp.node.active = false;
                }

            } else if ((this._data as MapBuildData).unionId > 0
                && (this._data as MapBuildData).unionId == MapCommand.getInstance().buildProxy.myUnionId) {
                //盟友的地
                this.btnMove.node.active = true;
                this.btnOccupy.node.active = false;
                this.btnGiveUp.node.active = false;
                this.btnBuild.node.active = false;
                this.btnTransfer.node.active = false;
            } else if ((this._data as MapBuildData).parentId > 0
            && (this._data as MapBuildData).parentId == MapCommand.getInstance().buildProxy.myUnionId) {
                //俘虏的地
                this.btnMove.node.active = true;
                this.btnOccupy.node.active = false;
                this.btnGiveUp.node.active = false;
                this.btnBuild.node.active = false;
                this.btnTransfer.node.active = false;
            }else {
                this.btnMove.node.active = false;
                this.btnOccupy.node.active = true;
                this.btnGiveUp.node.active = false;
                this.btnBuild.node.active = false;
                this.btnTransfer.node.active = false;
            }
            this.durableNode.active = true;
            this.labelDurable.string = this._data.curDurable + "/" + this._data.maxDurable;
            this.progressBarDurable.progress = this._data.curDurable / this._data.maxDurable;
        } else if (this._data instanceof MapCityData) {
            //点击其他城市
            if (this._data.rid == MapCommand.getInstance().cityProxy.myId) {
                //我自己的城池
                this.btnEnter.node.active = true;
                this.btnMove.node.active = false;
                this.btnOccupy.node.active = false;
                this.btnGiveUp.node.active = false;
                this.btnBuild.node.active = false;
                this.btnTransfer.node.active = false;
                this.btnTagAdd.node.active = false;
                this.btnTagRemove.node.active = false;

            } else if ((this._data as MapCityData).unionId > 0
                && (this._data as MapCityData).unionId == MapCommand.getInstance().cityProxy.myUnionId) {
                //盟友的城池
                this.btnMove.node.active = true;
                this.btnOccupy.node.active = false;
                this.btnGiveUp.node.active = false;
                this.btnBuild.node.active = false;
                this.btnTransfer.node.active = false;
            }else if ((this._data as MapCityData).parentId > 0
                && (this._data as MapCityData).parentId == MapCommand.getInstance().cityProxy.myUnionId) {
                //俘虏的城池
                this.btnMove.node.active = true;
                this.btnOccupy.node.active = false;
                this.btnGiveUp.node.active = false;
                this.btnBuild.node.active = false;
                this.btnTransfer.node.active = false;
            }else {
                this.btnMove.node.active = false;
                this.btnOccupy.node.active = true;
                this.btnGiveUp.node.active = false;
                this.btnBuild.node.active = false;
                this.btnTransfer.node.active = false;
            }
            this.bgSelect.setContentSize(600, 300);

            this.durableNode.active = true;
            this.leftInfoNode.active = false;
            this.labelDurable.string = this._data.curDurable + "/" + this._data.maxDurable;
            this.progressBarDurable.progress = this._data.curDurable / this._data.maxDurable;
        }

        if(this._data.type == MapResType.SYS_CITY){

            if(this._data.level >= 8){
                this.bgSelect.setContentSize(960*1.5, 480*1.5);
            }else if(this._data.level >= 5){
                this.bgSelect.setContentSize(960, 480);
            }else {
                this.bgSelect.setContentSize(960*0.5, 480*0.5);
            }
        }


        if (this.leftInfoNode.active ) {

            let resData: MapResData = MapCommand.getInstance().proxy.getResData(this._data.id);
            let resCfg: MapResConfig = MapCommand.getInstance().proxy.getResConfig(resData.type, resData.level);
        
            let soldiers = MapUICommand.getInstance().proxy.getDefenseSoldiers(resData.level);
            this.labelYield.string = MapCommand.getInstance().proxy.getResYieldDesList(resCfg).join("\n");
            this.labelSoldierCnt.string = "守备兵力 " + soldiers*3;
            
            if (this._data.nickName){
                this.labelName.string = this._data.nickName + ":" + this._data.name;
            }else{
                this.labelName.string = resCfg.name;
            }
        } else {
            this.labelName.string = this._data.name;
        }

        //归属属性
        if (this._data.rid == null || this._data.rid == 0){
            this.labelUnion.string = "未占领";
        }else{
            if (this._data.unionId > 0){
                this.labelUnion.string = this._data.unionName;
            }else{
                this.labelUnion.string = "在野";
            }
        }

        if (this._data.parentId > 0){
            this.labelLunxian.string = "沦陷";
        }else{
            this.labelLunxian.string = "";
        }


        //免战信息
        var limitTime = MapCommand.getInstance().proxy.getWarFree();
        var diff = DateUtil.getServerTime() - this._data.occupyTime;
        if (this._data instanceof MapBuildData){
            if(diff > limitTime){
                this.bgMain.active = false;
                this.labelMian.string = "";
            }else{
                this.bgMain.active = true;
                this.schedule(this.countDown, 1);
                this.countDown()
            }

        }else if(this._data instanceof MapCityData){
            if(diff < limitTime && this._data.parentId > 0){
                this.bgMain.active = true;
                this.schedule(this.countDown, 1);
                this.countDown()
            }else{
                this.bgMain.active = false;
                this.labelMian.string = "";
            }
        }
    }

    public countDown() {
        var diff = DateUtil.getServerTime() - this._data.occupyTime;
        var limitTime = MapCommand.getInstance().proxy.getWarFree();
        if (diff>limitTime){
            this.stopCountDown();
            
        }else{
            var str = DateUtil.converSecondStr(limitTime-diff);
            this.labelMian.string = "免战：" + str;
        }
    }

    public stopCountDown() {
        this.unscheduleAllCallbacks();
        this.labelMian.string = "";
        this.bgMain.active = false;
    }
}