import assert from 'node:assert/strict';
import test from 'node:test';
import {SpiritController} from '../src/entities/spirit/controller.ts';

test('held boost increases glide speed, releases back to normal and keeps diagonal speed normalized',()=>{
  const base=new SpiritController(),boost=new SpiritController(),diagonal=new SpiritController();
  for(const spirit of [base,boost,diagonal])spirit.reset(0,8,()=>0);
  for(let i=0;i<90;i++){
    base.update(1/60,{moveX:0,moveY:1,leapPressed:false},0,[],()=>0);
    boost.update(1/60,{moveX:0,moveY:1,leapPressed:false,boost:true},0,[],()=>0);
    diagonal.update(1/60,{moveX:1,moveY:1,leapPressed:false,boost:true},0,[],()=>0);
  }
  assert.ok(boost.velocity.length()>base.velocity.length()*1.6);
  assert.ok(Math.abs(boost.velocity.length()-diagonal.velocity.length())<1e-7);
  for(let i=0;i<60;i++)boost.update(1/60,{moveX:0,moveY:1,leapPressed:false,boost:false},0,[],()=>0);
  assert.ok(Math.abs(boost.velocity.length()-4.2)<.01,'releasing Shift restores normal glide');
});

test('boost retains solid collision during a leap and agrees across frame rates',()=>{
  for(const fps of [30,120]){
    const spirit=new SpiritController();spirit.reset(0,2,()=>0);
    for(let i=0;i<fps*2;i++){
      spirit.update(1/fps,{moveX:0,moveY:1,leapPressed:i===Math.round(fps*.2),boost:true},0,[{x:0,z:0,radius:.5}],()=>0);
      assert.ok(spirit.position.z>=.78-1e-8,'boost tunnels through a solid rock');
      assert.ok(spirit.position.y>=.28&&spirit.position.y<1.23,'boost changes the bounded leap');
    }
    assert.equal(spirit.grounded,true);
  }
});
