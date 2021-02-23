// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { SkillConf } from "../../config/skill/Skill";
import LoginCommand from "../../login/LoginCommand";
import DateUtil from "../../utils/DateUtil";
import { Tools } from "../../utils/Tools";
import MapUICommand from "./MapUICommand";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SkillItemLogic extends cc.Component {

   
    @property(cc.Label)
    nameLab: cc.Label = null;

    @property(cc.Sprite)
    icon:cc.Sprite = null;

    @property([cc.SpriteFrame])
    sps:cc.SpriteFrame[] = [];

    protected onEnable():void{
        
    }

    protected updateItem(confs:SkillConf):void{
        console.log("updateItem");
    }

}
