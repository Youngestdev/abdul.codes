--- 
title: "Building a crowdfund module on the Cosmos chain using Starport" 
description: "In this article, I walk you through on how to build a crowdfund module using Starport CLI" 
date: 2022-04-28 
---

>> I initially wrote this as an assessment in February for a role which didn't go work out after 2 long months ( one month unnecessary waiting ) of interviewing. Special thanks to Remi for staying up and helping with the test run the project. Chidi & Favour too, for reading the initial draft!

[Starport](https://starport.com/) is a robust and flexible platform that provides the tools needed to scaffold a working decentralized application on its own independent blockain. If you're building a decentralised application and priotize ease of working, you should really look into leveraging starport.

In this article, you'll create a blockchain module using Starport that allows you perform read and write operations for a crowdfund application. The application will allow a user create a crowdfund campaign, donate to a campaign by pledging an amount, removing a pledge, cancel the campaign as well as claim the donations once the campaign's goal has been met.

By the end of this tutorial, you will be able to scaffold a blockchain and a module, create types, messages and implement the logic for carrying out message transactions.

> If this is your first time using Starport, check out the [introductory tutorial](https://docs.starport.com/guide/hello.html) aimed at beginners.


## Prerequisites

In order to follow this tutorial, you should have:

+ Golang installed on your machine
+ Some familiarity with Golang

## Install Starport

The Starport CLI is responsible for scaffolding the applications' blockchain, modules, lists and messages. In your terminal, run the command below to install Starport's CLI:

```console
$ curl https://get.starport.com/starport! | bash
```

## Building a crowdfund blockchain module

In this section, you'll create a crowdfund blockchain module powered by Starport. The first step is to scaffold a blockchain with the `--no-module` tag:

```console
$ starport scaffold chain github.com/youngestdev/crowdfund --no-module
```

The command above scaffolds a blockchain `crowdfund` without creating the blockchain module. Since you'll be building the blockchain module from scratch, there's no need to automatically generate the module when creating the blockchain.

Next, change the working directory to the blockchain's directory and scaffold the crowdfund module:

```console
$ cd crowdfund
$ starport scaffold module crowdfund --dep bank
```

The command creates the crowdfund module indicating the dependence on the Cosmos SDK `bank` module. This means the crowdfund module will be able to access the methods contained in the `bank` module.

The next step is to define the properties of the module. The module crowdfund will consist of two components:

1. Campaigns
2. Pledges


#### Campaigns component

The `Campaigns` component is an array-like data structure. Each crowdfund campaign stored will be made up of the following properties:

+ An `id`
+ The `start` date of the campaign
+ The `end` date of the campaign
+ The `goal` of the campaign
+ The amount `pledged`
+ The `claimed` status of the campaign
+ The `creator` of the campaign

Now that you know how the crowdfund campaigns component is structured, scaffold the crowdfund campaigns store:

```console
$ starport scaffold list campaigns goal pledged start:int end:int claimed:bool creator --no-message
```

The `--no-message` flag appended to the command above is used to disable CRUD messages in the scaffold. The command automatically generates `proto/crowdfund/campaigns.proto` which contains the array-like structure and its parameters defined:

```proto
message Campaigns {
  uint64 id = 1;
  string goal = 2;
  string pledged = 3;
  int64 start = 4; 
  int64 end = 5; 
  bool claimed = 6;
  string creator = 7;
}
```

#### Pledges component


The `Pledges` component like the Campaigns component, is an array-like data structure. Each pledge stored will be made up of the following properties:

+ An `id`
+ The campaign's id `cid` pledged to
+ The `end` date of the campaign
+ The amount to be `pledged`
+ The `address` of the user creating a pledge

Now that you know how the pledges component is structured, scaffold the campaigns store:


```console
$ starport scaffold list pledges cid:uint amount address --no-message
```

The command creates the Pledges definition in 'proto/crowdfund/pledges.proto`:

```proto
message Pledges {
  uint64 id = 1;
  uint64 cid = 2;
  string amount = 3; 
  string address = 4; 
}
```

In `x/crowdfund/keeper/pledges.go`, define a function to retrieve a pledge entry from the user address:

```go
// GetPledgesByAddr returns a pledge from its address
func (k Keeper) GetPledgesByAddr(ctx sdk.Context, addr string) (val types.Pledges, found bool) {
	pledges := k.GetAllPledges(ctx)
	for _, pledge := range pledges {
		if pledge.Address == addr {
			return pledge, true
		}
	}
	return val, false
}
```

Now that you have defined both componenets for the crowdfund module, you will implement the messages for interacting with the module components in the next section.

### Messages

A message contains information that alters the state of a blockchain. For the crowdfund module, you will be implementing the messages to:
+ Create campaign
+ Claim crowdfund campaign
+ Cancel crowdfund campaign
+ Pledge to crowdfund campaign
+ Withdraw pledge from a crowdfund
+ Refund pledges

You will be using the `starport scaffold message` command to create each of the messages. After creating a message, a keeper file is generated as `x/crowdfund/keeper/msg_server_{MESSAGE NAME}.go`. The keeper file will house the operations carried out when a message transaction is broadcasted.

#### Create Campaign Message

The first line of action for the crowdfund is to create a crowdfund campaign. As a result, the inital message will handle the transaction when a user creates a crowdfund campaign.

The crowdfund campaign `launch` message requires three input parameters: the `goal` of the campaign, the `start` date and `end` date of the campaign. Both dates have the format YY-MM-DD/HH:MM.
In your terminal, create the `launch` message:

```console
starport scaffold message launch goal start end
```

The `launch` message creates a new campaigns object and stores the passed parameters if the following conditions are met:

1. The campaign can not start in the past
2. The campaign can not end before starting
3. The campaign's duration should not be more than 90 days

In the project directory in a separate terminal, install the `dateparse` module:

```console
$ go get -u github.com/araddon/dateparse
```

In the keeper file `x/crowdfund/keeper/msg_server_launch.go`, update your imports:

```go
import (
	"context"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"strings"
	"time"
	
	"github.com/araddon/dateparse"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/youngestdev/crowdfund/x/crowdfund/types"
)
```


Next, you'll need the start and end input to date type and create a maximum duration value. To do that, modify the `Launch()` function:

```go
func (k msgServer) Launch(goCtx context.Context, msg *types.MsgLaunch) (*types.MsgLaunchResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	startDate := strings.Replace(msg.Start, "/", " ", 1)
	endDate := strings.Replace(msg.End, "/", " ", 1)
	
	start, _ := dateparse.ParseLocal(startDate)
	end, _ := dateparse.ParseLocal(endDate)
	
	maxDuration := time.Now().Add(2160 * time.Hour)
)
```

Next, implement the conditions beneath the `maxDuration` value and save the campaign:

```go
if ctx.BlockTime().After(start) {
		return nil, sdkerrors.Wrap(sdkerrors.ErrInvalidRequest, "Can not launch campaign before now")
	}
	
	if end.Before(start) {
		return nil, sdkerrors.Wrap(sdkerrors.ErrInvalidRequest, "Can not end campaign before start")
	}
	
	if end.After(maxDuration) {
		return nil, sdkerrors.Wrap(sdkerrors.ErrInvalidRequest, "End should be less than maximum duration")
	}
	
	var campaign = types.Campaigns{
		Creator: msg.Creator,
		Goal:    msg.Goal,
		Pledged: "0",
		Start:   start.Unix(),
		End:     end.Unix(),
		Claimed: false,
	}
  
  	k.AppendCampaigns(ctx, campaign)
```

Great! You have created the `launch` message, run the chain and create your first crowdfund campaign. In your terminal, run the command:

```console
$ starport chain serve
```

In another terminal, create your first crowdfund campaign:

```console
$ crowdfundd tx crowdfund launch 1000 2022-03-03/17:00 2022-03-03/17:30 --from alice
```

The `--from` indicates the user alex creating the campaign.


Use the query command below to view the newly created campaign:

```console
$ crowdfundd query crowdfund list-campaigns
```

The newly created campaign is present in the list:

```console
Campaigns:
- claimed: false
  creator: cosmos1xr2yu5q9gdf93nllv7kq3z6yghvzttlzuu8szu
  end: "1646325000"
  goal: "1000"
  id: "0"
  pledged: "0"
  start: "1646323200"
```

#### Cancel Crowdfund Campaign

A user can decide to cancel the crowdfund campaign after it has been created. However, the campaign can be canceled by the creator only if the crowdfund camapaign is yet to start.

To cancel a campaign, the message transaction requires the campaign `id`. Scaffold the `cancel` message to take a parameter `id` of type `uint`:

```console
$ starport scaffold message cancel id:uint
```

Implement the condition for the cancel in `x/crowdfund/keeper/msg_server_cancel.go`:

```go
package keeper

import (
	"context"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/youngestdev/crowdfund/x/crowdfund/types"
)

func (k msgServer) Cancel(goCtx context.Context, msg *types.MsgCancel) (*types.MsgCancelResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	campaign, found := k.GetCampaigns(ctx, msg.Id)
	
	if ctx.BlockTime().Unix() > campaign.Start {
		return nil, sdkerrors.Wrap(sdkerrors.ErrInvalidRequest, "campaign started")
	}
	
	if !found {
		return nil, sdkerrors.Wrap(sdkerrors.ErrKeyNotFound, "Invalid campaign ID")
	}
	
	if campaign.Creator != msg.Creator {
		return nil, sdkerrors.Wrap(sdkerrors.ErrUnauthorized, "Cannot cancel: not the creator")
	}
	
	k.RemoveCampaigns(ctx, msg.Id)
	return &types.MsgCancelResponse{}, nil
}
```

In the snippet above, the message `cancel` will remove the campaign from the list of campaigns.

Create a new campaign starting tomorrow:

```console
$ crowdfundd tx crowdfund launch 1000 2022-03-04/17:20 2022-03-4/17:30 --from alice
```

Query the list of campaigns:

```console
$ crowdfundd query crowdfund list-campaigns

Campaigns:
- claimed: false
  creator: cosmos1xr2yu5q9gdf93nllv7kq3z6yghvzttlzuu8szu
  end: "1646325000"
  goal: "1000"
  id: "0"
  pledged: "0"
  start: "1646323200"
- claimed: false
  creator: cosmos1xr2yu5q9gdf93nllv7kq3z6yghvzttlzuu8szu
  end: "1646325000"
  goal: "1000"
  id: "1"
  pledged: "0"
  start: "1646324400"
pagination:
  next_key: null
  total: "0"
```

Cancel the crowdfund campaign and query the list of crowdfund campaigns:

```console
$ crowdfundd tx crowdfund cancel 1 --from alice
```

```console
$ crowdfundd query crowdfund list-campaigns

Campaigns:
- claimed: false
  creator: cosmos1xr2yu5q9gdf93nllv7kq3z6yghvzttlzuu8szu
  end: "1646325000"
  goal: "1000"
  id: "0"
  pledged: "0"
  start: "1646323200"
pagination:
  next_key: null
  total: "0"
```

From the response above, the campaign has been removed from the list.

#### Pledge to Crowdfund Campaign

You have successfully implemented the logic for creating and cancelling a campaign. Now, you'll implement the logic to allow a user pledge to an ongoing crowdfund campaign. This logic will also add the user to the `Pledges` list defined earlier on, and update the campaign with the value pledged.

Scaffold the `pledge` to allow users pledge to an ongoing campaign:

```console
$ starport scaffold message pledge id:uint amount
```

The logic for pledging to a campaign is defined in `x/crowdfund/keeper/msg_server_pledge.go`:

```go
import (
	"context"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/youngestdev/crowdfund/x/crowdfund/types"
)

func (k msgServer) Pledge(goCtx context.Context, msg *types.MsgPledge) (*types.MsgPledgeResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	
	campaign, found := k.GetCampaigns(ctx, msg.Id)
	
	if !found {
		return nil, sdkerrors.Wrap(sdkerrors.ErrNotFound, "Campaign not found")
	}
	
	if ctx.BlockTime().Unix() < campaign.Start {
		return nil, sdkerrors.Wrap(sdkerrors.ErrInvalidRequest, "campaign not started")
	}
	
	if ctx.BlockTime().Unix() > campaign.End {
		return nil, sdkerrors.Wrap(sdkerrors.ErrInvalidRequest, "campaign ended")
	}
	
	if campaign.Claimed == true {
		return nil, sdkerrors.Wrap(sdkerrors.ErrConflict, "Crowdfund has been claimed")
	}
	
	pledgeAddress, _ := sdk.AccAddressFromBech32(msg.Creator)
	
	amount, err := sdk.ParseCoinsNormalized(msg.Amount)
	
	if err != nil {
		return nil, sdkerrors.Wrap(sdkerrors.ErrInsufficientFunds, "Cannot pledge")
	}
	
	// Until campaign has ended and claimed, hold the money in an escrow - module.
	
	sdkError := k.bankKeeper.SendCoinsFromAccountToModule(ctx, pledgeAddress, types.ModuleName, amount)
	if sdkError != nil {
		return nil, sdkError
	}
	
	amnt, _ := sdk.ParseCoinNormalized(msg.Amount)
	
	amountPledged, _ := sdk.ParseCoinsNormalized(campaign.Pledged)
	
	newAmountPledged := amountPledged.Add(amnt)
	
	campaign.Pledged = newAmountPledged.String()
	
	// Update Pledgers list
	
	pledge, found := k.GetPledgesByAddr(ctx, msg.Creator)
	
	if found {
		pledged, _ := sdk.ParseCoinsNormalized(pledge.Amount)
		incrementPledge := pledged.Add(amnt)
		pledge.Amount = incrementPledge.String()
		// Update pledged amount
		k.SetPledges(ctx, pledge)
	}
	
	if !found {
		newPledge := types.Pledges{
			Cid:     campaign.Id,
			Amount:  msg.Amount,
			Address: msg.Creator,
		}
		k.AppendPledges(ctx, newPledge)
	}
	
	k.SetCampaigns(ctx, campaign)
	
	return &types.MsgPledgeResponse{}, nil
}
```

The logic above interacts with the bank module via the `k.bankkeeper.SendCoinsFromAccountToModule()` method. Therefore, update the `BankKeeper` interface in `x/crowdfund/types/expected_keepers.go`:

```go
// BankKeeper defines the expected interface needed to retrieve account balances.
type BankKeeper interface {
	SpendableCoins(ctx sdk.Context, addr sdk.AccAddress) sdk.Coins
	SendCoins(ctx sdk.Context, fromAddr sdk.AccAddress, toAddr sdk.AccAddress, amt sdk.Coins) error
	SendCoinsFromAccountToModule(ctx sdk.Context, senderAddr sdk.AccAddress, recipientModule string, amt sdk.Coins) error
	SendCoinsFromModuleToAccount(ctx sdk.Context, senderModule string, recipientAddr sdk.AccAddress, amt sdk.Coins) error
	// Methods imported from bank should be defined here
}
```

When a pledge is made, the funds pledged is locked in the escrow module account. This is to enable the user withdraw his pledge and ask for a refund if the campaign fails to meet its target.


Great! Restart the blockchain using the `-r` flag to reset the state:

```console
$ starport chain serve -r
```

Create a new crowdfund campaign:

```console
$ crowdfundd tx crowdfund launch 1000 2022-03-03/17:48 2022-03-03/20:00 --from alice
```

The blockchain user bob, will like to pledge to the ongoing campaign. Make a pledge to the campaign from bob's account:

```console
crowdfundd tx crowdfund pledge 0 500token --from bob
```

Query the list of campaigns to view the updated campaign pledged amount:

```console
$ crowdfundd query crowdfund list-campaigns

Campaigns:
- claimed: false
  creator: cosmos1zmgq88hczg40hnz6z5f4mjccdxpnar76fjvu3a
  end: "1646334000"
  goal: "1000"
  id: "0"
  pledged: 500token
  start: "1646326080"

```

Query the list of pledges to view the new pledge entry:

```console
$ crowdfundd query crowdfund list-pledges

Pledges:
- address: cosmos19gc4lttkrgx45s87s7nm6sltrw29qa636mwsgq
  amount: 500token
  cid: "0"
  id: "0"
```

#### Withdraw Pledge from Crowdfund Campaign

After a pledge, the user can choose to withdraw their pledge made before the campaign ends. For the user to withdraw their pledge, the `unpledge` message needs to be defined.

The message `unpledge` takes two paramters: the campaign `id` and `amount` pledged:

```console
$ starport scaffold message unpledge id:uint amount
```

In `x/crowdfund/keepers/msg_server_unpledge.go`, implement the logic:

```go
package keeper

import (
	"context"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/youngestdev/crowdfund/x/crowdfund/types"
)

func (k msgServer) Unpledge(goCtx context.Context, msg *types.MsgUnpledge) (*types.MsgUnpledgeResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	
	campaign, found := k.GetCampaigns(ctx, msg.Id)
	pledge, present := k.GetPledgesByAddr(ctx, msg.Creator)
	reduction, _ := sdk.ParseCoinsNormalized(msg.Amount)
	
	if !found {
		return nil, sdkerrors.Wrap(sdkerrors.ErrNotFound, "Campaign not found")
	}
	
	if present == false {
		return nil, sdkerrors.Wrap(sdkerrors.ErrNotFound, "Pledge not found")
	}
	
	// If current time is past the end time for the campaign
	if ctx.BlockTime().Unix() > campaign.End {
		return nil, sdkerrors.Wrap(sdkerrors.ErrInvalidRequest, "campaign has ended")
	}
	
	pledged, _ := sdk.ParseCoinsNormalized(pledge.Amount)
	
	if reduction.IsAllGT(pledged) {
		return nil, sdkerrors.Wrap(sdkerrors.ErrInvalidRequest, "pledge less than supply amount")
	}
	
	decrementPledge := pledged.Sub(reduction)
	pledge.Amount = decrementPledge.String()
	// Update pledged amount
	k.SetPledges(ctx, pledge)
	
	pledgeAddress, _ := sdk.AccAddressFromBech32(msg.Creator)
	amountPledged, _ := sdk.ParseCoinsNormalized(campaign.Pledged)
	
	newAmountPledged := amountPledged.Sub(reduction)
	
	campaign.Pledged = newAmountPledged.String()
	
	k.SetCampaigns(ctx, campaign)
	k.bankKeeper.SendCoinsFromModuleToAccount(ctx, types.ModuleName, pledgeAddress, reduction)
	
	return &types.MsgUnpledgeResponse{}, nil
}
```

The `unpledge` message requires two conditions:
- The operation must be executed by the user who made the pledge.
- The amount to be withdrawn must not exceed the amount pledged.

If all the conditions are met, the pledged amount is withdrawn and transfered to the user. The campaigns and pledges lists are equally updated.

With the implementation in place, unpledge 250token from the previously pledged campaign:

```console
$ crowdfundd tx crowdfund unpledge 0 250token --from bob
```

Query the list of campaigns to view the changes:

```console
$ crowdfundd query crowdfund list-campaigns

Campaigns:
- claimed: false
  creator: cosmos1zmgq88hczg40hnz6z5f4mjccdxpnar76fjvu3a
  end: "1646334000"
  goal: "1000"
  id: "0"
  pledged: 250token
  start: "1646326080"
```

The value for `pledged` has been reduced by `250token`.

Query the list of pledges to view the changes:

```console
$ crowdfundd query crowdfund list-pledges

Pledges:
- address: cosmos19gc4lttkrgx45s87s7nm6sltrw29qa636mwsgq
  amount: 250token
  cid: "0"
  id: "0"
```

#### Claim Crowdfund Campaign

The campaign creator can claim the funds pledged once the goal has been met and the campaign ended. Scaffold the message for `claim` that takes a parameter `id`:

```console
$ starport scaffold message claim id:uint
```

To claim a crowdfund campaign, the folllowing conditions must be met:
- The goal must be met
- The campaigned has ended

In `x/crowdfund/keeper/msg_server_claim.go`:

```go
package keeper

import (
	"context"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/youngestdev/crowdfund/x/crowdfund/types"
)

func (k msgServer) Claim(goCtx context.Context, msg *types.MsgClaim) (*types.MsgClaimResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	crowdfundAddress, _ := sdk.AccAddressFromBech32(msg.Creator)
	campaign, found := k.GetCampaigns(ctx, msg.Id)
	
	pledgedAmnt, _ := sdk.ParseCoinsNormalized(campaign.Pledged)
	goal, _ := sdk.ParseCoinsNormalized(campaign.Goal)
	
	if !found {
		return nil, sdkerrors.Wrap(sdkerrors.ErrKeyNotFound, "Campaign does not exist")
	}
	
	if campaign.Creator != msg.Creator {
		return nil, sdkerrors.Wrap(sdkerrors.ErrUnauthorized, "Claim failed: you're not the creator")
	}
	
	if ctx.BlockTime().Unix() < campaign.End {
		return nil, sdkerrors.Wrap(sdkerrors.ErrInvalidRequest, "Can not claim campaign before end date")
	}
	
	if pledgedAmnt.IsAllLT(goal) {
		return nil, sdkerrors.Wrap(sdkerrors.ErrInsufficientFunds, "goal not met")
	}
	
	if campaign.Claimed {
		return nil, sdkerrors.Wrap(sdkerrors.ErrInvalidRequest, "campaign claimed already")
	}
	
	campaign.Claimed = true
	
	funds, _ := sdk.ParseCoinsNormalized(campaign.Pledged)
	k.bankKeeper.SendCoinsFromModuleToAccount(ctx, types.ModuleName, crowdfundAddress, funds)
	
	k.SetCampaigns(ctx, campaign)
	
	
	return &types.MsgClaimResponse{}, nil
}
```

The following changes are made once the conditions are met:
- The funds pledged are released from the module escrow accout to the creator of the crowdfund campaign.
- The claimed status of the campaign is set to true to avoid reclaiming and the campaign object is updated.

Now that you have successfully implemented the claim logic, create a new camapaign that ends in a short period e.g 3 minutes to test the claim message:

```console
$ crowdfundd tx crowdfund launch 500token 2022-03-03/19:44 2022-03-03/19:46 --from alice
```

Query the campaigns list:

```console
$ crowdfundd query crowdfund list-campaigns

  claimed: false
  creator: cosmos1zmgq88hczg40hnz6z5f4mjccdxpnar76fjvu3a
  end: "1646333160"
  goal: 500token
  id: "1"
  pledged: "0"

```

Make a pledge of 500token:

```console
$ crowdfundd tx crowdfund pledge 1 500token --from bob
```

Query campaigns to verify the pledge:

```console
$ crowdfund query crowdfund list-pledges

- claimed: false
  creator: cosmos1zmgq88hczg40hnz6z5f4mjccdxpnar76fjvu3a
  end: "1646333160"
  goal: 500token
  id: "1"
  pledged: 500token
  start: "1646333040"

```

Claim the crowfund campaign:

```console
$ crowdfundd tx crowdfund claim 1 --from alice
```

Query campaigns to view changes:

```console
$ crowdfundd query crowdfund list-campaigns

- claimed: true
  creator: cosmos1zmgq88hczg40hnz6z5f4mjccdxpnar76fjvu3a
  end: "1646333160"
  goal: 500token
  id: "1"
  pledged: 500token
  start: "1646333040"

```
Running the command again returns an error:

```console
raw_log: 'failed to execute message; message index: 0: campaign claimed already: invalid
  request'
```

#### Refund Pledge

Lastly, if the crowdfund campaign fails to meet its target after the end date then users who made a pledge can ask for a refund.

Scaffold the `refund` message which takes an `id` as the only parameter:

```console
$ starport scaffold message refund id:uint
```

The `refund` message requires that the following conditions are met:
- The campaign failed to meet it's goal.
- The campaign has ended.
- The user made a pledge.

In `x/crowdfund/keeper/msg_server_refund.go`, implement the logic to refund the users' pledge if the conditions above are met:

```go
package keeper

import (
	"context"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/youngestdev/crowdfund/x/crowdfund/types"
)

func (k msgServer) Refund(goCtx context.Context, msg *types.MsgRefund) (*types.MsgRefundResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	
	campaign, found := k.GetCampaigns(ctx, msg.Id)
	pledge, present := k.GetPledgesByAddr(ctx, msg.Creator)
	
	pledgedAmnt, _ := sdk.ParseCoinsNormalized(campaign.Pledged)
	goal, _ := sdk.ParseCoinsNormalized(campaign.Goal)
	
	pledgeAddress, _ := sdk.AccAddressFromBech32(msg.Creator)
	
	if !present {
		return nil, sdkerrors.Wrap(sdkerrors.ErrNotFound, "Pledge not found")
	}
	
	if !found {
		return nil, sdkerrors.Wrap(sdkerrors.ErrKeyNotFound, "Campaign does not exist")
	}
	
	if ctx.BlockTime().Unix() < campaign.End {
		return nil, sdkerrors.Wrap(sdkerrors.ErrInvalidRequest, "Can not refund campaign before end date")
	}
	
	if pledgedAmnt.IsAllGTE(goal) {
		return nil, sdkerrors.Wrap(sdkerrors.ErrInvalidRequest, "Target met")
	}
	
	pledged, _ := sdk.ParseCoinsNormalized(pledge.Amount)
	campaign.Pledged = pledged.Sub(pledged).String()
	k.bankKeeper.SendCoinsFromModuleToAccount(ctx, types.ModuleName, pledgeAddress, pledged)
	k.RemovePledges(ctx, pledge.Id)
	k.SetCampaigns(ctx, campaign)
	return &types.MsgRefundResponse{}, nil
}
```

If the conditions aforementioned are met, the amount pledged is refunded and the campaign updated accordingly. However, an error will be returned if the refund is carried out on a campaign whose target was met.

Restart your blockain using the `-r` flag to reset the blockchain's state:

```console
$ starport chain serve -r
```

Create a new crowdfund campaign:
```console
$ crowdfundd tx crowdfund launch 1000token 2022-03-03/22:39 2022-03-03/22:43 --from bob
```

Pledge 500 token for the first crowdfund:

```console
$ crowdfundd tx crowdfund pledge 0 500token --from alice
```

Query your campaigns:

```console
$ crowdfundd query crowdfund list-campaigns

Campaigns:
- claimed: false
  creator: cosmos1eqkpxpxwllveazx24cutwj2z6z202nakj34w4t
  end: "1646343780"
  goal: 1000token
  id: "0"
  pledged: 500token
  start: "1646343600"
```

The time for the first campaign with `id` 0 has lapsed, initiate a refund:

```console
$ crowdfundd tx crowdfund refund 0 --from alice
```

Query your campaigns:

```console
$ crowdfundd query crowdfund list-campaigns

Campaigns:
- claimed: false
  creator: cosmos1eqkpxpxwllveazx24cutwj2z6z202nakj34w4t
  end: "1646343780"
  goal: 1000token
  id: "0"
  pledged: ""
  start: "1646343600"
pagination:
  next_key: null
  total: "0"
```

From the query result above, you will notice that the `pledged` is now empty indicating that the operation was successful.

## Conclusion

This article taught you how to build a crowdfund blockchain module using Starport. You also learned how to scaffold and use the starport cli efficiently, as well as broadcast transactions to the blockchain from the command line and took advantage of the hot-reload provided by starport to facilitate the build process.

Now that you have learned how to build a module, create a blockchain module to refresh all what you've learned. You can find the code used in this article on [GitHub](https://github.com/Youngestdev/pledgetogoal)

## Comments

- The logic can be improved. I discovered a better way of implementing certain parts but will leave them until I am chanced to fix it.